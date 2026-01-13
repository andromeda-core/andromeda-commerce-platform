// debugOverlay.js
(function () {
    if (typeof window === 'undefined') return;

    // PANEL
    const panel = document.createElement('div');
    panel.style.cssText = `
        position:fixed;
        bottom:0;
        left:0;
        right:0;
        max-height:40%;
        background:#000;
        color:#0f0;
        font-size:12px;
        padding:24px 6px 6px;
        overflow:auto;
        z-index:999999;
        font-family:monospace;
        box-sizing:border-box;
    `;

    // CLEAR BUTTON
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'CLEAR';
    clearBtn.style.cssText = `
        position:absolute;
        top:4px;
        right:6px;
        font-size:11px;
        padding:2px 6px;
        background:#222;
        color:#0f0;
        border:1px solid #0f0;
        cursor:pointer;
    `;

    clearBtn.onclick = () => {
        panel.querySelectorAll('.debug-line').forEach((el) => el.remove());
    };

    panel.appendChild(clearBtn);
    document.body.appendChild(panel);

    // DOUBLE TAP TO CLEAR
    let lastTap = 0;
    panel.addEventListener('touchend', () => {
        const now = Date.now();
        if (now - lastTap < 300) {
            clearBtn.onclick();
        }
        lastTap = now;
    });

    // PRINT FUNCTION
    const print = (type, args) => {
        const line = document.createElement('div');
        line.className = 'debug-line';
        line.textContent = `[${type}] ${args
            .map((a) => (typeof a === 'object' ? JSON.stringify(a) : a))
            .join(' ')}`;
        panel.appendChild(line);
        panel.scrollTop = panel.scrollHeight;
    };

    // PATCH CONSOLE
    ['log', 'debug', 'warn', 'error'].forEach((type) => {
        const original = console[type];
        console[type] = (...args) => {
            original.apply(console, args);
            print(type, args);
        };
    });

    // MANUAL CLEAR (OPTIONAL)
    window.__clearDebug = () => clearBtn.onclick();
})();
