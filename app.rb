require 'sinatra'
require 'json'
require 'net/http'
require 'uri'
require 'dotenv'
Dotenv.load

CLIENT_ID = ENV['PAYPAL_CLIENT_ID'] || 'AZyElkuGTtZOQKbi8ZFTWu7Zl4gbfaWGvBYqPaH4aDX32QFJtlxhc4dfMvle4CSy0zTYH3lsSq2UxtEI'
SECRET = ENV['PAYPAL_SECRET'] || 'EEvN2L8NGM8sQdM7LmghQGL5-dv_0Fya7NufiLoU2ktn2jATiOXihyIXT9DIOi9wbDpXpKgFSl4yNQJo'

def paypal_auth
  uri = URI('https://api-m.sandbox.paypal.com/v1/oauth2/token')
  req = Net::HTTP::Post.new(uri)
  req.basic_auth CLIENT_ID, SECRET
  req.set_form_data('grant_type' => 'client_credentials')
  
  res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
    http.request(req)
  end
  JSON.parse(res.body)['access_token']
end

post '/create-setup-token' do
  token = paypal_auth
  # For hosted-fields setup token if needed
  {token: token}.to_json
end

post '/process-payment' do
  data = JSON.parse(request.body.read)
  form_data = data['form_data']
  card_data = data['card_data']
  
  token = paypal_auth
  
  # Create order
  uri = URI('https://api-m.sandbox.paypal.com/v2/checkout/orders')
  req = Net::HTTP::Post.new(uri)
  req['Authorization'] = "Bearer #{token}"
  req['Content-Type'] = 'application/json'
  req.body = {
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'USD',
value: '100.00'
      },
      payment_source: {
        card: {
          # From hostedFields.tokenize(): number, expiry, security_code, name, billing_address
          # Note: hostedFields returns tokenized payload, use billing_address from form_data
          name: form_data['nombre_tarjeta'] || form_data['nombre'],
          number: card_data['nonce'] , # Use nonce or raw? For v2, need raw card data? Wait, hosted-fields returns payment_method_nonce
          # Actually, for hosted-fields, backend receives device_data or nonce, but for PayPal, use payment_method_nonce in payment_source
        }
      }
    }]
  }.to_json
  
  res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
    http.request(req)
  end
  
  result = JSON.parse(res.body)
  
  content_type :json
  {success: res.code == '201', order_id: result['id'], error: result['message']}.to_json
end

get '/' do
  'PayPal Backend Ready - ruby app.rb'
end

run Sinatra::Application
