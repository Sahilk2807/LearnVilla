// learn-villa/static/js/app.js
document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const skeletonLoader = `
        <div class="space-y-4">
            <div class="h-24 bg-slate-200 rounded animate-pulse"></div>
            <div class="space-y-2">
                <div class="h-6 bg-slate-200 rounded w-3/4 animate-pulse"></div>
                <div class="h-6 bg-slate-200 rounded w-1/2 animate-pulse"></div>
            </div>
            <div class="h-40 bg-slate-200 rounded animate-pulse"></div>
        </div>`;

    const loadPage = async (page) => {
        if (!page) page = 'index';
        console.log(`Loading page: ${page}`);
        mainContent.innerHTML = skeletonLoader;
        try {
            const response = await fetch(`/api/page/${page}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            mainContent.innerHTML = html;
            window.history.pushState({ page }, '', `/${page}`);
            bindEventListeners();
        } catch (error) {
            console.error('Failed to load page:', error);
            mainContent.innerHTML = `<div class="text-center p-8"><h2 class="text-2xl font-bold text-red-500">Oops!</h2><p>Something went wrong. Please try again.</p></div>`;
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
        submitButton.disabled = true;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        try {
            const response = await fetch(form.action, {
                method: form.method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();

            if (result.status === 'success') {
                if (result.redirect) {
                    window.location.href = result.redirect; // Full redirect for auth changes
                } else if(result.message) {
                    alert(result.message); // Simple alert for now
                    form.reset();
                    // Optionally, reload the current view
                    loadPage(window.history.state?.page || 'index');
                }
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Form submission error:', error);
            alert('An unexpected error occurred.');
        } finally {
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
    };

    const bindEventListeners = () => {
        // AJAX links
        document.querySelectorAll('.ajax-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                loadPage(page);
            });
        });

        // AJAX forms
        document.querySelectorAll('.ajax-form').forEach(form => {
            form.addEventListener('submit', handleFormSubmit);
        });

        // Specific listeners for dynamic content
        // Example: Toggling login/signup tabs
        const signupTab = document.getElementById('signup-tab');
        const loginTab = document.getElementById('login-tab');
        const signupForm = document.getElementById('signup-form');
        const loginForm = document.getElementById('login-form');

        if (signupTab && loginTab) {
            signupTab.addEventListener('click', () => {
                loginForm.classList.add('hidden');
                signupForm.classList.remove('hidden');
                loginTab.classList.remove('border-sky-500', 'text-sky-600');
                signupTab.classList.add('border-sky-500', 'text-sky-600');
            });
            loginTab.addEventListener('click', () => {
                signupForm.classList.add('hidden');
                loginForm.classList.remove('hidden');
                signupTab.classList.remove('border-sky-500', 'text-sky-600');
                loginTab.classList.add('border-sky-500', 'text-sky-600');
            });
        }
    };
    
    // Handle browser back/forward buttons
    window.onpopstate = (event) => {
        if (event.state) {
            loadPage(event.state.page);
        }
    };

    // Initial page load
    const initialPage = window.initialPage || 'index';
    loadPage(initialPage);
});