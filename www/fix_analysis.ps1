$file = 'c:\Users\USER\Desktop\motorcycle_assist\www\index.html'
$content = Get-Content $file -Raw
$startStr = '            // 判斷超速事件，回傳帶有數值細節的事件陣列'
$endStr = 'currentRideDataRef.current = [];'
$idxStart = $content.IndexOf($startStr)
$idxEnd = $content.IndexOf($endStr, $idxStart)
if ($idxStart -ge 0 -and $idxEnd -ge 0) {
    Write-Host Found target block!
} else {
    Write-Host Target block not found!
}
