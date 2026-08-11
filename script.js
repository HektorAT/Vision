// =============================================================
//  Hektor Vision - Landing Page
//  TODO: coloque aqui a URL de embed da demo (YouTube/Vimeo).
//  Enquanto estiver vazio, o play apenas avisa no console e o
//  thumbnail permanece na tela (nada de vídeo placeholder errado).
// =============================================================
// YouTube: use SEMPRE a forma /embed/ID. O ?autoplay=1 faz tocar já ao clicar,
// já que o play só é acionado pela interação do usuário no thumbnail.
const VIDEO_URL = 'https://www.youtube.com/embed/aqz-KE-bpKQ'; // TEMP: vídeo de teste (Big Buck Bunny), trocar pela demo real

document.addEventListener('DOMContentLoaded', () => {

    // ---------- Ícones (Lucide) ----------
    if (window.lucide) lucide.createIcons();

    // ---------- Animações de scroll ----------
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // anima uma vez só
            }
        });
    }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    document.querySelectorAll('.reveal-up, .reveal-left').forEach(el => observer.observe(el));

    // ---------- Navbar: efeito de vidro ao rolar ----------
    const navbar = document.getElementById('navbar');
    if (navbar) {
        let ticking = false;
        const onScroll = () => {
            navbar.classList.toggle('scrolled', window.scrollY > 20);
            ticking = false;
        };
        window.addEventListener('scroll', () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(onScroll);
            }
        }, { passive: true });
        onScroll();
    }

    // ---------- Menu mobile ----------
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuBtn && mobileMenu) {
        const iconMenu = menuBtn.querySelector('.icon-menu');
        const iconClose = menuBtn.querySelector('.icon-close');

        const setMenu = (open) => {
            mobileMenu.classList.toggle('hidden', !open);
            menuBtn.setAttribute('aria-expanded', String(open));
            menuBtn.setAttribute('aria-label', open ? 'Fechar menu de navegação' : 'Abrir menu de navegação');
            if (iconMenu) iconMenu.classList.toggle('hidden', open);
            if (iconClose) iconClose.classList.toggle('hidden', !open);
        };

        menuBtn.addEventListener('click', () => {
            setMenu(mobileMenu.classList.contains('hidden'));
        });

        // Fecha ao clicar em um link do menu
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => setMenu(false));
        });

        // Fecha ao passar para o layout desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768 && !mobileMenu.classList.contains('hidden')) setMenu(false);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
                setMenu(false);
                menuBtn.focus();
            }
        });
    }

    // ---------- FAQ (acordeão) ----------
    const faqBtns = document.querySelectorAll('.faq-btn');

    const closeFaq = (btn) => {
        const panel = document.getElementById(btn.getAttribute('aria-controls'));
        btn.setAttribute('aria-expanded', 'false');
        if (panel) panel.classList.remove('active');
        const item = btn.closest('.faq-item');
        if (item) item.classList.remove('is-open');
    };

    faqBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const isOpen = btn.getAttribute('aria-expanded') === 'true';

            faqBtns.forEach(closeFaq); // um aberto por vez

            if (!isOpen) {
                const panel = document.getElementById(btn.getAttribute('aria-controls'));
                btn.setAttribute('aria-expanded', 'true');
                if (panel) panel.classList.add('active');
                const item = btn.closest('.faq-item');
                if (item) item.classList.add('is-open');
            }
        });
    });

    // ---------- Modal de captura de lead ----------
    const modal = document.getElementById('lead-modal');

    if (modal) {
        const overlay = modal.querySelector('.modal-overlay');
        const content = modal.querySelector('.modal-content');
        const closeBtn = document.getElementById('close-modal');
        let lastFocused = null;

        const openModal = () => {
            lastFocused = document.activeElement;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.body.classList.add('overflow-hidden'); // trava o scroll de fundo
            requestAnimationFrame(() => {
                overlay.classList.remove('opacity-0');
                content.classList.remove('opacity-0', 'scale-95');
            });
            const firstInput = modal.querySelector('input');
            if (firstInput) firstInput.focus();
        };

        const closeModal = () => {
            overlay.classList.add('opacity-0');
            content.classList.add('opacity-0', 'scale-95');
            document.body.classList.remove('overflow-hidden');
            setTimeout(() => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }, 300);
            if (lastFocused) lastFocused.focus();
        };

        document.querySelectorAll('.cta-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });
        });

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);

        document.addEventListener('keydown', (e) => {
            if (modal.classList.contains('hidden')) return;

            if (e.key === 'Escape') {
                closeModal();
                return;
            }

            // Mantém o foco dentro do modal enquanto ele está aberto
            if (e.key === 'Tab') {
                const focusable = content.querySelectorAll('a[href], button, input, select, textarea');
                if (!focusable.length) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });
    }

    // ---------- Player de vídeo (modal maior, com autoplay) ----------
    const videoContainer = document.getElementById('video-container');
    const videoModal = document.getElementById('video-modal');
    const videoModalIframe = document.getElementById('video-modal-iframe');
    const videoModalClose = document.getElementById('video-modal-close');

    if (videoContainer && videoModal && videoModalIframe) {
        const openVideoModal = () => {
            if (!VIDEO_URL) {
                console.warn('[Hektor] Defina VIDEO_URL em script.js para habilitar a demo em vídeo.');
                return;
            }

            const separator = VIDEO_URL.includes('?') ? '&' : '?';
            videoModalIframe.src = `${VIDEO_URL}${separator}autoplay=1`;
            videoModal.classList.remove('hidden');
            videoModal.classList.add('flex');
            document.body.style.overflow = 'hidden';
        };

        const closeVideoModal = () => {
            videoModal.classList.add('hidden');
            videoModal.classList.remove('flex');
            videoModalIframe.src = '';
            document.body.style.overflow = '';
        };

        videoContainer.addEventListener('click', openVideoModal);
        videoContainer.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openVideoModal();
            }
        });

        videoModalClose?.addEventListener('click', closeVideoModal);
        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal) closeVideoModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !videoModal.classList.contains('hidden')) closeVideoModal();
        });
    }
});
