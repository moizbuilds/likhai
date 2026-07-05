# End-to-end test: drives a real browser against the dev server.
# /api/convert is mocked at the network layer so tests are free and
# deterministic — engine correctness is covered by the unit tests.
from playwright.sync_api import sync_playwright, expect


def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        page.route(
            "**/api/convert",
            lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body='{"ok": true, "urdu": "کیا حال ہے"}',
            ),
        )

        # converter flow
        page.goto("http://localhost:5173")
        expect(page.get_by_text("لکھائی")).to_be_visible()

        # Wait for hydration: server HTML renders instantly, but the oninput
        # handler only exists once the JS has loaded — typing before that is
        # typing into a dead textbox (a race this test actually hit).
        page.wait_for_load_state("networkidle")

        page.get_by_label("Likho").fill("kya haal hai")
        expect(page.get_by_text("کیا حال ہے")).to_be_visible(timeout=4000)  # after debounce

        # card studio opens, themes switch, Escape closes
        page.get_by_role("button", name="ٹرک پہ لگا دو").click()
        expect(page.get_by_role("dialog")).to_be_visible()
        expect(page.get_by_role("button", name="Download PNG")).to_be_visible()
        page.get_by_role("radio", name="Gulab · گلاب").click()
        page.keyboard.press("Escape")
        expect(page.get_by_role("dialog")).not_to_be_visible()

        # error state shows retry
        page.unroute("**/api/convert")
        page.route("**/api/convert", lambda route: route.abort())
        page.get_by_label("Likho").fill("dil ki baat")
        expect(page.get_by_role("button", name="Try again")).to_be_visible(timeout=4000)

        browser.close()
        print("ALL E2E CHECKS PASSED")


if __name__ == "__main__":
    run()
