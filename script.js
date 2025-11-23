(function preloadPreviewImages() {
    // プレビューで使う主要画像をユーザ操作前にプリロードしておく
    try {
        const preloadList = ['img/pt_desu.png'];
        preloadList.forEach(src => {
            const i = new Image();
            i.src = src;
        });
    } catch (e) {
        // 無視
    }
})();

// スムーススクロール
(document.querySelectorAll('a[href^="#"]') || []).forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// スクロール時にヘッダーへソフトな影を付与
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

// プロジェクトカードのクリック（モーダル等のフック）
(document.querySelectorAll('.project-card') || []).forEach(item => {
    item.addEventListener('click', function() {
        console.log('Work item clicked:', this.querySelector('h3')?.textContent || '');
    });
});

// DOM 準備完了後に各種初期化を行う
document.addEventListener('DOMContentLoaded', () => {
    // About セクションの動画自動再生フォールバック
    const video = document.getElementById('aboutIntro');
    const container = document.querySelector('.about-video');
    const playOverlay = document.querySelector('.about-video .play-overlay');
    if (video && container) {
        // 動画フォーマット非対応ブラウザではコンテナ自体を非表示にする
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
            if (video.canPlayType && video.canPlayType('video/mp4') !== '') canPlay = true;
        }

        if (!canPlay) {
            try { container.style.display = 'none'; } catch (e) {}
        } else {
            // 自動再生を試行（多くのブラウザは muted の場合に自動再生を許可）
            const tryPlay = () => {
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        try { container.style.display = 'block'; } catch (e) {}
                        if (playOverlay) playOverlay.style.display = 'none';
                    }).catch(() => {
                        try { container.style.display = 'none'; } catch (e) {}
                    });
                }
            };

            // 初回試行
            tryPlay();

            // タブが再び表示されたときに再試行
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') tryPlay();
            });

            // 再生エラー時は控えめに非表示
            video.addEventListener('error', () => {
                try { container.style.display = 'none'; } catch (e) {}
            });

            // クリックで再生 / 一時停止を切り替え（ミュート維持）
            video.addEventListener('click', (e) => {
                e.preventDefault();
                try {
                    if (video.paused) {
                        video.muted = true;
                        video.play().catch(() => {});
                    } else {
                        video.pause();
                    }
                } catch (err) {
                    // 無視
                }
            });
        }
    }

    // 画像プレビュー: クリックで拡大表示（左から入って一時停止、右へ退出）
    const overlay = document.getElementById('image-preview-overlay');
    const img = document.getElementById('image-preview-img');
    if (!overlay || !img) return;

    // 指定した src でプレビューを開始するヘルパー
    function showPreview(src) {
        if (!src) return;
        img.src = src;
        overlay.style.display = 'flex';
        // アニメーションを再起動するためクラスを更新
        overlay.classList.remove('playing');
        setTimeout(() => {
            overlay.classList.add('playing');
            overlay.setAttribute('aria-hidden', 'false');
        }, 20);
    }

    // アニメーション終了時に即時非表示（フェードなし）
    img.addEventListener('animationend', () => {
        overlay.classList.remove('playing');
        overlay.setAttribute('aria-hidden', 'true');
        img.src = '';
        overlay.style.display = 'none';
    });

    // メニュー、ヒーロー、プロジェクト画像へクリックハンドラを付与
    // メニューアイコン（ロゴ）
    const logoImg = document.querySelector('.logo-icon');
    if (logoImg) {
        logoImg.addEventListener('click', (e) => {
            e.preventDefault();
            showPreview('img/pt_desu.png');
        });
    }

    // プロジェクトサムネイル
    document.querySelectorAll('.project-thumb img').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            showPreview(el.src);
        });
    });
});
