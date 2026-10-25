import subprocess
try:
    with open('c:/Users/USER/Desktop/motorcycle_assist/www/index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    start_str = '<script type=" text/babel\>'
 end_str = '</script>'

 start_idx = content.find(start_str)
 if start_idx != -1:
 start_idx += len(start_str)
 end_idx = content.find(end_str, start_idx)
 js_code = content[start_idx:end_idx]

 with open('test_jsx.js', 'w', encoding='utf-8') as f:
 f.write(js_code)

 # Node cannot directly check JSX/Babel syntax using -c, it will fail on React tags!
 # So wait, -c will fail anyway on JSX tags like <App />
except Exception as e:
 print('Error:', e)
