// ==UserScript==
// @name         Veiligheidsplan Wijzigen/Opslaan knop
// @namespace    https://tampermonkey.net/
// @version      2.4
// @description  Spiegelt exact de Veiligheidsplan Wijzigen/Opslaan-knop onder Einde uitvoering bedienplan
// @match        https://os.prd.stedingroep.nl/*
// @author       Pijper, RJC (Roy)
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // ===== ORIGINELE WIJZIGEN-ZOEKCODE =====
    function findVeiligheidsplanEditButton() {
        const containers = document.querySelectorAll('[id*="ctnTop"]');

        for (const container of containers) {
            const title = container.querySelector('[id*="Title"]');
            if (!title) continue;

            if (
                title.textContent.includes('Veiligheidsplan') ||
                title.textContent.includes('Bedieningsplan')
                ) {
                const action = container.querySelector('[id*="Action"]');
                if (!action) continue;

                const btn = action.querySelector('.fa-edit')?.closest('a, button');
                if (btn) return btn;
            }
        }
        return null;
    }

    // ===== LETTERLIJKE KOPIE, MAAR DAN VOOR OPSLAAN =====
    function findVeiligheidsplanSaveButton() {
        const containers = document.querySelectorAll('[id*="ctnTop"]');

        for (const container of containers) {
            const title = container.querySelector('[id*="Title"]');
            if (!title) continue;

            if (
                title.textContent.includes('Veiligheidsplan') ||
                title.textContent.includes('Bedieningsplan')
                ) {
                const action = container.querySelector('[id*="Action"]');
                if (!action) continue;

                const btn = [...action.querySelectorAll('a, button')]
                    .find(b => b.textContent.includes('Opslaan'));

                if (btn) return btn;
            }
        }
        return null;
    }

    function findEndExecutionButton() {
        return [...document.querySelectorAll('button')]
            .find(b => b.textContent.toLowerCase().includes('einde uitvoering'));
    }

    function createMirrorButton(originalBtn, targetBtn) {
        if (document.getElementById('tm-veiligheidsplan-mirror')) return;

        const mirror = document.createElement('button');
        mirror.id = 'tm-veiligheidsplan-mirror';
        mirror.type = 'button';
        mirror.className = targetBtn.className;
        mirror.style.marginTop = '15px';
        mirror.style.marginLeft = '0px';

        const syncText = () => {
            const span = originalBtn.querySelector('span');
            const text = span ? span.textContent.trim() : originalBtn.textContent.trim();
            mirror.innerHTML = `
                <div class="vertical-align flex-direction-row">
                    <span>Wijzigen / Opslaan</span>
                    <i class="fa fa-edit margin-left-s"></i>
                </div>
            `;
        };

        syncText();

        // ===== AANGEPASTE KLIKLOGICA =====
        mirror.addEventListener('click', e => {
            e.preventDefault();

            // 1. Probeer WIJZIGEN
            let btn = findVeiligheidsplanEditButton();

            // 2. Als die er niet is, zoek OPSLAAN
            if (!btn) {
                btn = findVeiligheidsplanSaveButton();
            }

            // 3. Klik de gevonden knop
            if (btn) {
                btn.click();
            }
        });

        new MutationObserver(syncText).observe(originalBtn, {
            childList: true,
            subtree: true,
            characterData: true
        });

        targetBtn.parentElement.appendChild(mirror);
    }

    const observer = new MutationObserver(() => {
        const editBtn = findVeiligheidsplanEditButton();
        const endBtn = findEndExecutionButton();

        if (editBtn && endBtn) {
            createMirrorButton(editBtn, endBtn);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();