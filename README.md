# PayPal Integration

## Backend (Sinatra Ruby)
1. Install Ruby: https://rubyinstaller.org/downloads/ (Windows MSI)
2. bundle install
3. Copy .env.example to .env, add PAYPAL_CLIENT_ID, PAYPAL_SECRET (Sandbox)
4. ruby app.rb → localhost:4567

## Frontend (Netlify)
git push → deploy.

Replace YOUR_SANDBOX_CLIENT_ID in index.html

Test form → card fields → $50 payment → data to Netlify forms + modal.


