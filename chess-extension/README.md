# Chess Elo Hider

A Chrome extension that hides opponent information on chess.com so you can focus purely on the game.

## Features

- **Hide Opponent Elo** — Stop letting ratings get in your head
- **Hide My Elo** — Play without worrying about your own rating
- **Hide Opponent Name** — Play anonymously against "Opponent"
- **Hide Country** — Remove the country flag from the opponent's profile
- **Hide Profile Image** — Replace the opponent's avatar with a blank image
- **Hide Score** — Hide the head-to-head score tracker

All settings persist between sessions and toggle instantly — no refresh needed.

## Installation

Install manually:
1. Clone the repo
2. Run `npm install`
3. Run `npm run build`
4. Go to `chrome://extensions`
5. Enable **Developer mode**
6. Click **Load unpacked** and select the `.output/chrome-mv3` folder

## Development
```bash
npm install
npm run dev
```

## Built With

- [WXT](https://wxt.dev/) — Web Extension Framework
- [React](https://react.dev/)
- TypeScript

## Support

If you find this extension useful, consider [buying me a coffee](https://ko-fi.com/darshgandhi) ☕

## License

MIT