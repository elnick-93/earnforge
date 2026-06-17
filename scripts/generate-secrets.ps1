# generate-secrets.ps1
# Run this to generate fresh strong secrets for .env
# Usage: powershell -ExecutionPolicy Bypass -File .\scripts\generate-secrets.ps1

$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()

# JWT_SECRET - 64 bytes = very strong for HS256 etc.
$jwtBytes = New-Object byte[] 64
$rng.GetBytes($jwtBytes)
$jwtSecret = [Convert]::ToBase64String($jwtBytes)

# Strong admin bootstrap password (28 chars, mixed)
$chars = (65..90) + (97..122) + (48..57) + @(33,35,36,37,38,42,64,63,95)  # A-Z a-z 0-9 ! # $ % & * @ ? _
$adminPass = -join ($chars | Get-Random -Count 28 | ForEach-Object { [char]$_ })

Write-Host "=== COPY THESE INTO YOUR .env (or hosting env vars) ===" -ForegroundColor Green
Write-Host ""
Write-Host "JWT_SECRET=$jwtSecret"
Write-Host ""
Write-Host "ADMIN_BOOTSTRAP_PASSWORD=$adminPass"
Write-Host ""
Write-Host "Also update:"
Write-Host "- ADMIN_BOOTSTRAP_EMAIL (use a real secure email)"
Write-Host "- NEXT_PUBLIC_APP_URL (your final domain)"
Write-Host "- All Stripe keys and STRIPE_WEBHOOK_SECRET from your Stripe dashboard"
Write-Host ""
Write-Host "After setting, restart the server: npm run dev (or redeploy)"
Write-Host ""
Write-Host "Store the admin password securely and change it after first use!" -ForegroundColor Yellow