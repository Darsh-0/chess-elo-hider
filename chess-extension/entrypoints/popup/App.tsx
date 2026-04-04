import React, { useState, useEffect } from "react"
import './App.css';
import githubIcon from '../../assets/github.svg'
import background from "@/entrypoints/background.ts";

const DEFAULTS = {
    hideElo: false,
    hideOpponentElo: false,
    hideCountry: false,
    hideName: false,
    hideImage: false,
    hideScore: false,
}

type Settings = typeof DEFAULTS

function App() {
    const [settings, setSettings] = useState<Settings>(DEFAULTS)

    useEffect(() => {
        chrome.storage.local.get(DEFAULTS, (result) => {
            setSettings(result as Settings)
        })
    }, [])

    const handleChange = (key: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.checked
        setSettings(prev => ({ ...prev, [key]: value }))
        chrome.storage.local.set({ [key]: value })
    }

    const checkboxes: { key: keyof Settings; label: string; tooltip: string }[] = [
        { key: 'hideElo',         label: 'Hide My Elo',        tooltip: 'Hides your own elo rating' },
        { key: 'hideOpponentElo', label: 'Hide Opponent Elo',  tooltip: 'Hides your opponent\'s elo rating' },
        { key: 'hideCountry',     label: 'Hide Country',       tooltip: 'Hides your opponent\'s country flag' },
        { key: 'hideName',        label: 'Hide Name',          tooltip: 'Hides your opponent\'s username' },
        { key: 'hideImage',       label: 'Hide Profile Image', tooltip: 'Hides your opponent\'s profile picture' },
        { key: 'hideScore',       label: 'Hide Score',         tooltip: 'Hides the score tracker for people you\'ve already vs' },
    ]

    return (
        <>
            <div className="background">
                <button className="icon" onClick={() => chrome.tabs.create({ url: 'https://github.com/Darsh-0/chess-elo-hider' })}>
                    <img style={{ width: "25px", height: "25px"}} src={githubIcon}/>
                </button>
                <h1 className="title">Chess Elo Hider</h1>
                <p className="subtitle" >For <span className="donate" style={{color: "white"}} onClick={() => chrome.tabs.create({ url: 'https://www.chess.com' })}>
                        chess.com
                    </span></p>
                <div className="card">
                    <div style={{ padding: "5px", fontFamily: "sans-serif", fontSize: "20px", textAlign: "left" }}>
                        {checkboxes.map(({ key, label, tooltip }) => (
                            <label key={key} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                <input
                                    style={{ transform: "scale(1.5)", marginRight: '8px' }}
                                    type="checkbox"
                                    checked={settings[key]}
                                    onChange={handleChange(key)}
                                />
                                <div className="tooltip-wrapper">
                                    {label}
                                    <span className="tooltip">{tooltip}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="footer">
                    <p className="me">Made by Darsh</p>
                    <div className="tooltip-wrapper">
                    <span className="donate" onClick={() => chrome.tabs.create({ url: 'https://ko-fi.com/darshgandhi' })}>
                        ☕ Support me
                    </span>
                        <span className="tooltip">please</span>
                    </div>
                </div>
            </div>
        </>
    )
}

export default App;