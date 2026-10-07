# Aurum Guard - Merchant Dashboard (Graduation Project Demo)

Static prototype of the merchant dashboard for the **Multi-Camera Visual Tag Tracking and Theft Alert System for Gold Shops**.
Pure HTML5, CSS3 and vanilla JavaScript. No build step, no backend. All data is **mock/demo data**.

## Files
- `index.html` - page shell
- `style.css` - design system (navy and gold)
- `script.js` - mock data, routing, filters, modals, notifications, live simulation
- `assets/` - optional images

Chart.js is loaded from a CDN (jsDelivr). Everything else is local.

## Deploy on GitHub Pages
1. Create a repository and upload `index.html`, `style.css`, `script.js`, `README.md`.
2. Settings -> Pages -> Source: `main` branch, `/ (root)`.
3. Open `https://USERNAME.github.io/REPOSITORY-NAME/`.

## Demo story
1. **Dashboard** - overall store status.
2. **Live Monitoring / Cameras** - 6 simulated camera feeds and live events.
3. **Store Map** - click item markers to see location, tag, camera.
4. **Alerts** - G-1017 (exit zone, no sale confirmation) is critical. Acknowledge or mark as reviewed.
5. **Items** - open G-1017 to see the full movement timeline.

## Alignment with the project document
Item states (On Display, In Hand, Out of View, Sold, Suspicious, Missing), zones (Display, Interaction, Exit), up to 6 cameras, risk score bands, manual sale confirmation, and human verification of every alert.
Alerts are decision support, not proof of theft. Analytics values and the evidence clip are demo placeholders.
