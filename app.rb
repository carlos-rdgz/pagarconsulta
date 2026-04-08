require 'sinatra'
require 'json'
require 'net/http'
require 'uri'
require 'dotenv'
Dotenv.load

CLIENT_ID = ENV['PAYPAL_CLIENT_ID'] || 'AZyElkuGTtZOQKbi8ZFTWu7Zl4gbfaWGvBYqPaH4aDX32QFJtlxhc4dfMvle4CSy0zTYH3lsSq2UxtEI'
SECRET = ENV['PAYPAL_SECRET'] || 'EEvN2L8NGM8sQdM7LmghQGL5-dv_0Fya7NufiLoU2ktn2jATiOXihyIXT9DIOi9wbDpXpKgFSl4yNQJo'

def get_paypal_token
  uri = URI('https://api-m.sandbox.paypal.com/v1/oauth2/token')
  req = Net::HTTP::Post.new(uri)
  req.basic_auth CLIENT_ID, SECRET
  req.set_form_data('grant_type' => 'client_credentials')
  res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) {|http| http.request(req) }
  JSON.parse(res.body)['access_token']
end

post '/create-order' do
  token = get_paypal_token
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
      }
    }]
  }.to_json
  
  res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) {|http| http.request(req) }
  
  result = JSON.parse(res.body)
  status res.code.to_i
  result.to_json
end

post '/capture-order' do
  order_id = JSON.parse(request.body.read)['orderID']
  token = get_paypal_token
  uri = URI("https://api-m.sandbox.paypal.com/v2/checkout/orders/#{order_id}/capture")
  req = Net::HTTP::Post.new(uri)
  req['Authorization'] = "Bearer #{token}"
  req['Content-Type'] = 'application/json'
  
  res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) {|http| http.request(req) }
  
  result = JSON.parse(res.body)
  status res.code.to_i
  result.to_json
end

get '/' do
  'Sinatra PayPal Backend Ready (sandbox) - Run: ruby app.rb'
end

run Sinatra::Application
