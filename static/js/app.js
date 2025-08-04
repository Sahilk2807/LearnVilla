// learn-villa/static/js/app.js
document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const skeletonLoader = `<div class="space-y-4"><div class="h-24 bg-slate-200 rounded animate-pulse"></div><div class="space-y-2"><div class="h-6 bg-slate-200 rounded w-3/4 animate-pulse"></div><div class="h-6 bg-slate-200 rounded w-1/2 animate-pulse"></div></div><div class="h-40 bg-slate-200 rounded animate-pulse"></div></div>`;

    const loadPage = async (page) => {
        if (!page) page = 'index';
        mainContent.innerHTML = skeletonLoader;
        history.pushState({ page }, '', `/#/${page}`); // Use hash-based routing for simplicity
        try {
            const response = await fetch(`/api/page/${page}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            mainContent.innerHTML = await response.text();
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
        submitButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
        submitButton.disabled = true;

        // Differentiate between JSON and Multipart forms
        const isMultipart = form.enctype === 'multipart/form-data';
        const body = isMultipart ? new FormData(form) : JSON.stringify(Object.fromEntries(new FormData(form).entries()));
        const headers = isMultipart ? {} : { 'Content-Type': 'application/json' };

        try {
            const response = await fetch(form.action, { method: form.method, headers, body });
            const result = await response.json();
            if (result.status === 'success') {
                if (result.redirect) {
                    window.location.href = result.redirect;
                } else {
                    alert(result.message || 'Success!');
                    const currentPage = window.location.hash.substring(2) || 'index';
                    loadPage(currentPage); // Reload current page to see changes
                }
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Form submission error:', error);
            alert('An unexpected error occurred.');
        } finally {
            submitButton.innerHTML = form.querySelector('button[type="submit"]').textContent || 'Submit';
            submitButton.disabled = false;
        }
    };

    // NEW: Handler for simple button actions (like wishlist)
    const handleAjaxAction = async (e) => {
        e.preventDefault();
        const button = e.currentTarget;
        const actionUrl = button.dataset.action;
        const courseId = button.dataset.courseId;
        
        button.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
        try {
            const response = await fetch(actionUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ course_id: courseId }),
            });
            const result = await response.json();
            if (response.status === 401) { // Not logged in
                loadPage('login');
                return;
            }
            if (result.status === 'success') {
                // Toggle button appearance
                if (result.added) {
                    button.classList.replace('bg-slate-200', 'bg-pink-100');
                    button.classList.replace('text-slate-800', 'text-pink-600');
                    button.innerHTML = `<i class="fas fa-heart mr-2"></i> In Wishlist`;
                } else {
                    button.classList.replace('bg-pink-100', 'bg-slate-200');
                    button.classList.replace('text-pink-600', 'text-slate-800');
                    button.innerHTML = `<i class="far fa-heart mr-2"></i> Add to Wishlist`;
                }
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Action error:', error);
        }
    };

    const bindEventListeners = () => {
        document.querySelectorAll('.ajax-link').forEach(link => {
            if (link.dataset.eventBound) return;
            link.dataset.eventBound = true;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                loadPage(link.dataset.page);
            });
        });

        document.querySelectorAll('.ajax-form').forEach(form => {
            if (form.dataset.eventBound) return;
            form.dataset.eventBound = true;
            form.addEventListener('submit', handleFormSubmit);
        });

        // NEW: Bind wishlist buttons
        document.querySelectorAll('.wishlist-toggle-btn').forEach(btn => {
             if (btn.dataset.eventBound) return;
             btn.dataset.eventBound = true;
             btn.addEventListener('click', handleAjaxAction);
        });

        // Tab switching for login/signup
        const signupTab = document.getElementById('signup-tab');
        if (signupTab) {
            signupTab.addEventListener('click', () => {
                document.getElementById('login-form').classList.add('hidden');
                document.getElementById('signup-form').classList.remove('hidden');
                document.getElementById('login-tab').classList.remove('border-sky-500', 'text-sky-600');
                signupTab.classList.add('border-sky-500', 'text-sky-600');
            });
            document.getElementById('login-tab').addEventListener('click', () => {
                 document.getElementById('signup-form').classList.add('hidden');
                 document.getElementById('login-form').classList.remove('hidden');
                 signupTab.classList.remove('border-sky-500', 'text-sky-600');
                 document.getElementById('login-tab').classList.add('border-sky-500', 'text-sky-600');
            });
        }
    };
    
    window.onhashchange = () => {
        const page = window.location.hash.substring(2) || 'index';
        loadPage(page);
    };

    const page = window.location.hash.substring(2) || window.initialPage || 'index';
    loadPage(page);
});