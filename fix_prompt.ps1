$files = Get-ChildItem -Path "c:/Users/raghu/Downloads/static-snapshot (3)/henrybplantmuseum" -Filter "*.html"

$oldText = "Hi, I'm Henry! I can help you navigate the museum, answer history questions, or adjust the accessibility settings. How can I assist you today?"
$oldText2 = "Hi, I'm Henry! I can help you navigate the museum, answer `nhistory questions, or adjust the accessibility settings. How can I assist you today?"
$newText = "Hi, I'm Henry, your personal AI guide to the Tampa Bay Hotel! I'm here to help you navigate our exhibits, answer questions about the Gilded Age, or adjust your accessibility settings. How can I assist you today?"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    # A regex to match the old text spanning multiple lines
    $content = $content -replace "(?s)Hi, I'm Henry! I can help you navigate the museum, answer\s*history questions, or adjust the accessibility settings\. How can I assist you today\?", $newText
    Set-Content -Path $file.FullName -Value $content
}
Write-Output "Updated AI starting prompt."
