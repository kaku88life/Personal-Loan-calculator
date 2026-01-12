$url = "https://github.com/justfont/open-huninn-font/releases/download/v2.0/jf-openhuninn-2.0.ttf"
$output = "c:\Users\amy41\OneDrive\Desktop\vibe coding\personal-Loan-calculator\chrome-extension-loan-calcultor\fonts\jf-openhuninn-2.0.ttf"

Write-Host "Downloading Open Huninn font..."
Invoke-WebRequest -Uri $url -OutFile $output
Write-Host "Download complete: $output"

# Also remove the corrupt file
Remove-Item "c:\Users\amy41\OneDrive\Desktop\vibe coding\personal-Loan-calculator\chrome-extension-loan-calcultor\fonts\NotoSansTC-Regular.ttf" -ErrorAction SilentlyContinue
