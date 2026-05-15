param(
  [string]$OutPath = (Join-Path $PSScriptRoot "..\public\og-image.png")
)

Add-Type -AssemblyName System.Drawing

$width = 1200
$height = 630
$outputDirectory = Split-Path -Parent $OutPath

if (-not (Test-Path $outputDirectory)) {
  New-Item -ItemType Directory -Path $outputDirectory | Out-Null
}

$bitmap = New-Object System.Drawing.Bitmap $width, $height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$backgroundRect = New-Object System.Drawing.Rectangle 0, 0, $width, $height
$backgroundBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  $backgroundRect,
  [System.Drawing.Color]::FromArgb(255, 13, 23, 48),
  [System.Drawing.Color]::FromArgb(255, 5, 10, 18),
  90
)
$graphics.FillRectangle($backgroundBrush, $backgroundRect)

$gridPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(14, 255, 255, 255)), 1
for ($y = 105; $y -lt $height; $y += 105) {
  $graphics.DrawLine($gridPen, 0, $y, $width, $y)
}
for ($x = 150; $x -lt $width; $x += 150) {
  $graphics.DrawLine($gridPen, $x, 0, $x, $height)
}

$blueGlow = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(30, 67, 182, 255))
$warmGlow = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(28, 255, 153, 102))
$graphics.FillEllipse($blueGlow, 738, -72, 428, 428)
$graphics.FillEllipse($warmGlow, 856, 316, 376, 376)

$accentRect = New-Object System.Drawing.Rectangle 90, 160, 420, 300
$accentBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  $accentRect,
  [System.Drawing.Color]::FromArgb(255, 139, 211, 255),
  [System.Drawing.Color]::FromArgb(255, 255, 153, 102),
  15
)
$accentPen = New-Object System.Drawing.Pen $accentBrush, 20
$accentPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$accentPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$accentPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$mPoints = @(
  (New-Object System.Drawing.Point 126, 421),
  (New-Object System.Drawing.Point 126, 202),
  (New-Object System.Drawing.Point 245, 361),
  (New-Object System.Drawing.Point 364, 202),
  (New-Object System.Drawing.Point 364, 421)
)
$graphics.DrawLines($accentPen, $mPoints)
$graphics.DrawLine($accentPen, 425, 196, 463, 196)
$graphics.DrawLine($accentPen, 463, 196, 463, 425)
$graphics.FillEllipse((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 239, 246, 255))), 445, 178, 36, 36)
$graphics.FillEllipse((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 139, 211, 255))), 445, 407, 36, 36)

$titleFont = New-Object System.Drawing.Font "Segoe UI", 86, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$kickerFont = New-Object System.Drawing.Font "Consolas", 25, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$lineFont = New-Object System.Drawing.Font "Segoe UI", 36, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
$smallLineFont = New-Object System.Drawing.Font "Segoe UI", 30, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
$titleBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 239, 246, 255))
$accentTextBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 139, 211, 255))
$lineBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 199, 215, 232))
$mutedBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 159, 182, 207))

$graphics.DrawString("M20R1", $titleFont, $titleBrush, 540, 148)
$graphics.DrawString("GOVERNED INFRASTRUCTURE", $kickerFont, $accentTextBrush, 544, 286)
$graphics.DrawString("Owned compute. Visible state.", $lineFont, $lineBrush, 544, 366)
$graphics.DrawString("Direct operators for systems that", $smallLineFont, $mutedBrush, 544, 421)
$graphics.DrawString("cannot afford drift.", $smallLineFont, $mutedBrush, 544, 462)

$bitmap.Save((Resolve-Path $outputDirectory).Path + "\" + (Split-Path -Leaf $OutPath), [System.Drawing.Imaging.ImageFormat]::Png)

$graphics.Dispose()
$bitmap.Dispose()
$backgroundBrush.Dispose()
$gridPen.Dispose()
$blueGlow.Dispose()
$warmGlow.Dispose()
$accentBrush.Dispose()
$accentPen.Dispose()
$titleFont.Dispose()
$kickerFont.Dispose()
$lineFont.Dispose()
$smallLineFont.Dispose()
$titleBrush.Dispose()
$accentTextBrush.Dispose()
$lineBrush.Dispose()
$mutedBrush.Dispose()
