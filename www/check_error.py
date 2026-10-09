from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        
        page.on('console', lambda msg: print(f'CONSOLE: {msg.type}: {msg.text}'))
        page.on('pageerror', lambda err: print(f'ERROR: {err}'))
        
        page.goto('file:///C:/Users/USER/Desktop/motorcycle_assist/www/index.html')
        page.wait_for_timeout(3000)
        browser.close()

run()
