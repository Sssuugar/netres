Add-Type -AssemblyName System.Drawing

# Use USERPROFILE to avoid encoding issues
$userProfile = $env:USERPROFILE
$sourceDir = Join-Path $userProfile ".gemini\antigravity\brain\5272eac3-786e-4bad-8bde-0e543c85f69c"
$destDir = "d:\code\vscode\netres-mac-frame\public\img\news"

Write-Host "Re-compressing with stricter settings..."

$files = Get-ChildItem $sourceDir -Filter "startup_*.png"

foreach ($file in $files) {
    if ($file.Name -match "startup_(\d+)_") {
        $id = $matches[1]
        $newName = "startup-$id.jpg"
        $destPath = Join-Path $destDir $newName

        $img = [System.Drawing.Image]::FromFile($file.FullName)
        
        # Resize to max width 600 (Aggressive resizing)
        $newWidth = 600
        $newHeight = [int]($img.Height * ($newWidth / $img.Width))
        $resized = new-object System.Drawing.Bitmap $newWidth, $newHeight
        $graph = [System.Drawing.Graphics]::FromImage($resized)
        $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graph.DrawImage($img, 0, 0, $newWidth, $newHeight)
        
        # Encoder parameters for JPEG quality - Aggressive compression
        $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]30) # Quality 30

        $resized.Save($destPath, $codec, $encoderParams)
        
        $img.Dispose()
        $resized.Dispose()
        $graph.Dispose()
        
        $finalSize = (Get-Item $destPath).Length / 1KB
        Write-Host "Processed $newName - Size: $([math]::Round($finalSize, 2)) KB"
    }
}
