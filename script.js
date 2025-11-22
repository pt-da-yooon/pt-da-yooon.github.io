// smooth scroll
(document.querySelectorAll('a[href^="#"]') || []).forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// add a soft shadow to the header on scroll
let lastScroll = 0;
const header = document.querySelector('header');
const hero = document.querySelector('#hero');

function setHeroMargin() {
    if (!header || !hero) return;
    hero.style.marginTop = header.offsetHeight + 'px';
}

setHeroMargin();
window.addEventListener('resize', setHeroMargin);

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (header) {
        header.style.boxShadow = currentScroll > 100 ? '0 2px 20px rgba(0, 0, 0, 0.1)' : 'none';
    }
    lastScroll = currentScroll;
});

// project card click (hook for modal etc.)
(document.querySelectorAll('.project-card') || []).forEach(item => {
    item.addEventListener('click', function() {
        console.log('Work item clicked:', this.querySelector('h3')?.textContent || '');
    });
});

// About セクションの動画自動再生フォールバック
document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('aboutIntro');
    const container = document.querySelector('.about-video');
    const overlay = document.querySelector('.about-video .play-overlay');
    if (!video || !container) return;

    // 動画フォーマット非対応ブラウザではコンテナ自体を非表示にして
    // 「何もない」ように見せる（ユーザーに気付かれない程度）
    let canPlay = false;
    const sources = video.querySelectorAll('source');
    if (sources.length) {
        sources.forEach(s => {
            const type = s.type || '';
            if (type && video.canPlayType && video.canPlayType(type) !== '') {
                canPlay = true;
            }
        });
    } else {
        // source がない場合は一般的な mp4 の再生可否を確認
        if (video.canPlayType && video.canPlayType('video/mp4') !== '') canPlay = true;
    }

    if (!canPlay) {
        try { container.style.display = 'none'; } catch (e) {}
        return;
    }

    // 再生を試みる（多くのブラウザは muted の場合に自動再生を許可する）
    const tryPlay = () => {
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // 自動再生成功：動画領域を表示し、オーバーレイを隠す
                try { container.style.display = 'block'; } catch (e) {}
                if (overlay) overlay.style.display = 'none';
            }).catch(() => {
                // 自動再生がブロックされた場合は、コンテナごと非表示にする
                try { container.style.display = 'none'; } catch (e) {}
            });
        }
    };

    // 初回試行
    tryPlay();

    // オーバーレイのクリック処理は無効化（自動再生ができない場合は何も表示しない方針）

    // 画面が見えない（タブ切替など）だった場合の再試行
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') tryPlay();
    });
    
    // 再生エラーが出たら目立たないようにコンテナを消す
    video.addEventListener('error', () => {
        try {
            container.style.display = 'none';
        } catch (e) {}
    });

    // クリックで再生 / 一時停止を切り替え
    video.addEventListener('click', (e) => {
        e.preventDefault();
        try {
            if (video.paused) {
                // 自動再生条件を満たすためミュートは維持
                video.muted = true;
                video.play().catch(() => {});
            } else {
                video.pause();
            }
        } catch (err) {
            // 無視
        }
    });
});
