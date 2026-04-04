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

    const checkboxes: { key: keyof Settings; label: string }[] = [
        { key: 'hideElo',         label: 'Hide My Elo' },
        { key: 'hideOpponentElo', label: 'Hide Opponent Elo' },
        { key: 'hideCountry',     label: 'Hide Country' },
        { key: 'hideName',     label: 'Hide Name' },
        { key: 'hideImage',     label: 'Hide Profile Image' },
        { key: 'hideScore',     label: 'Hide Score' },
    ]

    return (
        <>
            <div className="background">
                <button className="icon" onClick={() => chrome.tabs.create({ url: 'https://github.com/Darsh-0/chess-elo-hider' })}>
                    <img style={{ width: "25px", height: "25px"}} src={githubIcon}/>
                </button>
                <h1 className="title">Chess Elo Hider</h1>
                <div className="card">
                    <div style={{ padding: "5px", fontFamily: "sans-serif", fontSize: "20px", textAlign: "left" }}>
                        {checkboxes.map(({ key, label }) => (
                            <label key={key} style={{ display: 'block', marginBottom: '8px' }}>
                                <input
                                    style={{ transform: "scale(1.5)", marginRight: '8px' }}
                                    type="checkbox"
                                    checked={settings[key]}
                                    onChange={handleChange(key)}
                                />
                                {label}
                            </label>
                        ))}
                    </div>
                </div>
                <div className="footer">
                    <p className="me">Made by Darsh</p>
                    <button style={{background: "#4F83EC"}} onClick={() => chrome.tabs.create({ url: 'https://ko-fi.com/darshgandhi' })}>☕ Support me</button>
                </div>


            </div>
        </>
    )
}

export default App;