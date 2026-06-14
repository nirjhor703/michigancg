/* =========================================================
   MICHIGAN FAMILY CAREGIVER LLC
   Main JavaScript - Fully Optimized Production Version
   File: js/main.js
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    /* =====================================================
       WEB3FORMS CONFIG
    ===================================================== */
    const WEB3FORMS_ACCESS_KEY = "1043e408-af99-416c-8666-fb26ef8eca55";
    const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

    const COMPANY_NAME = "Michigan Family Caregiver LLC";
    const COMPANY_EMAIL = "info@michiganfamilycaregiverllc.com";

    /* =====================================================
       ELEMENT SELECTORS (Unified Initialization)
    ===================================================== */
    const body = document.body;

    // Selectors support both classes or IDs safely
    const hamburger = document.getElementById("hamburger") || document.querySelector(".hamburger");
    const navbar = document.getElementById("navbar") || document.querySelector(".navbar");
    const themeToggle = document.getElementById("themeToggle");
    const mainHeader = document.getElementById("mainHeader");

    const careRequestForm = document.getElementById("careRequestForm");
    const submitBtn = document.getElementById("submitBtn");

    const successModal = document.getElementById("successModal");
    const modalClose = document.getElementById("modalClose");
    const modalDoneBtn = document.getElementById("modalDoneBtn");

    const newsletterForm = document.getElementById("newsletterForm");

    let isSubmitting = false;

    /* =====================================================
       HEADER SCROLL EFFECT
    ===================================================== */
    function handleHeaderScroll() {
        if (!mainHeader) return;
        if (window.scrollY > 20) {
            mainHeader.classList.add("scrolled");
        } else {
            mainHeader.classList.remove("scrolled");
        }
    }

    handleHeaderScroll();
    window.addEventListener("scroll", handleHeaderScroll);

    /* =====================================================
       MOBILE MENU INTERACTION (Standard Built-In Blocks)
    ===================================================== */
    function closeMobileMenu() {
        if (!hamburger || !navbar) return;
        hamburger.classList.remove("active");
        navbar.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
    }

    function openMobileMenu() {
        if (!hamburger || !navbar) return;
        hamburger.classList.add("active");
        navbar.classList.add("active");
        hamburger.setAttribute("aria-expanded", "true");
    }

    if (hamburger && navbar) {
        hamburger.setAttribute("aria-expanded", "false");

        hamburger.addEventListener("click", function (event) {
            event.stopPropagation();
            if (navbar.classList.contains("active")) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        navbar.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", closeMobileMenu);
        });

        document.addEventListener("click", function (event) {
            const clickedInsideMenu = navbar.contains(event.target);
            const clickedOnHamburger = hamburger.contains(event.target);

            if (!clickedInsideMenu && !clickedOnHamburger) {
                closeMobileMenu();
            }
        });
    }

    /* =====================================================
       KEYBOARD ACTIONS
    ===================================================== */
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeMobileMenu();
            closeSuccessModal();
        }
    });

    /* =====================================================
       ACTIVE NAV LINK
    ===================================================== */
    function setActiveNavLink() {
        if (!navbar) return;

        const currentPage = getCurrentPageName();
        const navLinks = navbar.querySelectorAll("a");

        navLinks.forEach(function (link) {
            const href = link.getAttribute("href");
            if (!href) return;

            const linkPage = href.split("/").pop();
            link.classList.remove("active");

            if (linkPage === currentPage) {
                link.classList.add("active");
            }
            if (currentPage === "" && linkPage === "index.html") {
                link.classList.add("active");
            }
        });
    }

    function getCurrentPageName() {
        const path = window.location.pathname;
        const page = path.substring(path.lastIndexOf("/") + 1);
        return page || "index.html";
    }

    setActiveNavLink();

    /* =====================================================
       DARK / LIGHT THEME
    ===================================================== */
    function applySavedTheme() {
        const savedTheme = localStorage.getItem("mfc_theme");
        if (savedTheme === "dark") {
            body.classList.add("dark-mode");
            updateThemeIcon("dark");
        } else {
            body.classList.remove("dark-mode");
            updateThemeIcon("light");
        }
    }

    function updateThemeIcon(theme) {
        if (!themeToggle) return;
        if (theme === "dark") {
            themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
            themeToggle.setAttribute("aria-label", "Switch to light theme");
        } else {
            themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
            themeToggle.setAttribute("aria-label", "Switch to dark theme");
        }
    }

    applySavedTheme();

    if (themeToggle) {
        themeToggle.addEventListener("click", function () {
            const isDark = body.classList.toggle("dark-mode");
            if (isDark) {
                localStorage.setItem("mfc_theme", "dark");
                updateThemeIcon("dark");
            } else {
                localStorage.setItem("mfc_theme", "light");
                updateThemeIcon("light");
            }
        });
    }

    /* =====================================================
       FORM VALIDATION HELPERS
    ===================================================== */
    function showError(inputElement, message) {
        if (!inputElement) return;
        const formGroup = inputElement.closest(".form-group");
        inputElement.classList.add("input-error");
        if (!formGroup) return;
        const errorElement = formGroup.querySelector(".field-error");
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    function clearError(inputElement) {
        if (!inputElement) return;
        const formGroup = inputElement.closest(".form-group");
        inputElement.classList.remove("input-error");
        if (!formGroup) return;
        const errorElement = formGroup.querySelector(".field-error");
        if (errorElement) {
            errorElement.textContent = "";
        }
    }

    function showSmsError(message) {
        const smsError = document.getElementById("smsError");
        if (smsError) {
            smsError.textContent = message;
        }
    }

    function clearSmsError() {
        const smsError = document.getElementById("smsError");
        if (smsError) {
            smsError.textContent = "";
        }
    }

    function isValidEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

    // Dynamic phone validation schema matching desktop UI specifications
    function isValidPhone(phone) {
        const phonePattern = /^[0-9+\-\s().]{7,20}$/;
        return phonePattern.test(phone);
    }

    function validateTextField(inputElement, fieldName, minLength = 2) {
        if (!inputElement) return true;
        const value = inputElement.value.trim();
        if (!value) {
            showError(inputElement, `${fieldName} is required.`);
            return false;
        }
        if (value.length < minLength) {
            showError(inputElement, `${fieldName} must be at least ${minLength} characters.`);
            return false;
        }
        clearError(inputElement);
        return true;
    }

    function validateEmailField(inputElement) {
        if (!inputElement) return true;
        const value = inputElement.value.trim();
        if (!value) {
            showError(inputElement, "Email address is required.");
            return false;
        }
        if (!isValidEmail(value)) {
            showError(inputElement, "Please enter a valid email address.");
            return false;
        }
        clearError(inputElement);
        return true;
    }

    function validatePhoneField(inputElement) {
        if (!inputElement) return true;
        const value = inputElement.value.trim();
        if (!value) {
            showError(inputElement, "Phone number is required.");
            return false;
        }
        if (!isValidPhone(value)) {
            showError(inputElement, "Please enter a valid phone number.");
            return false;
        }
        clearError(inputElement);
        return true;
    }

    function validateSelectField(selectElement, fieldName) {
        if (!selectElement) return true;
        const value = selectElement.value.trim();
        if (!value) {
            showError(selectElement, `Please select ${fieldName}.`);
            return false;
        }
        clearError(selectElement);
        return true;
    }

    function validateSmsConsent(checkboxElement) {
        if (!checkboxElement) return true;
        if (!checkboxElement.checked) {
            showSmsError("SMS consent is required before submitting.");
            return false;
        }
        clearSmsError();
        return true;
    }

    function scrollToFirstError() {
        const firstErrorInput = document.querySelector(".input-error");
        if (firstErrorInput) {
            firstErrorInput.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
            setTimeout(function () {
                firstErrorInput.focus();
            }, 350);
        }
    }

    /* =====================================================
       CARE REQUEST FORM VALIDATION & SUBMISSION
    ===================================================== */
    if (careRequestForm) {
        const fullName = document.getElementById("fullName");
        const phoneNumber = document.getElementById("phoneNumber");
        const emailAddress = document.getElementById("emailAddress");
        const serviceType = document.getElementById("serviceType");
        const careFor = document.getElementById("careFor");
        const message = document.getElementById("message");
        const smsConsent = document.getElementById("smsConsent");

        const formFields = [fullName, phoneNumber, emailAddress, serviceType, careFor, message];

        formFields.forEach(function (field) {
            if (!field) return;
            field.addEventListener("input", function () { clearError(field); });
            field.addEventListener("change", function () { clearError(field); });
        });

        if (smsConsent) {
            smsConsent.addEventListener("change", function () {
                validateSmsConsent(smsConsent);
            });
        }

        careRequestForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            if (isSubmitting) return;

            let isFormValid = true;

            if (!validateTextField(fullName, "Full name", 2)) isFormValid = false;
            if (!validatePhoneField(phoneNumber)) isFormValid = false;
            if (!validateEmailField(emailAddress)) isFormValid = false;
            if (!validateSelectField(serviceType, "a requested service type")) isFormValid = false;
            if (!validateSelectField(careFor, "who you are seeking care for")) isFormValid = false;
            if (!validateTextField(message, "Message", 5)) isFormValid = false;
            if (!validateSmsConsent(smsConsent)) isFormValid = false;

            if (!isFormValid) {
                scrollToFirstError();
                return;
            }

            await submitCareRequestForm();
        });
    }

    async function submitCareRequestForm() {
        const isWeb3FormsKeyMissing = !WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY === "YOUR_WEB3FORMS_ACCESS_KEY_HERE";

        if (isWeb3FormsKeyMissing) {
            setSubmitLoading(true);
            setTimeout(function () {
                setSubmitLoading(false);
                careRequestForm.reset();
                openSuccessModal(
                    "Thank you for submitting!",
                    "Demo mode: form validation is working. Add your Web3Forms access key to send emails."
                );
            }, 800);
            return;
        }

        try {
            isSubmitting = true;
            setSubmitLoading(true);

            const formData = new FormData(careRequestForm);
            formData.append("access_key", WEB3FORMS_ACCESS_KEY);
            formData.append("subject", `New Care Request - ${COMPANY_NAME}`);
            formData.append("from_name", `${COMPANY_NAME} Website`);
            formData.append("replyto", getInputValue("emailAddress"));
            formData.append("Company Email", COMPANY_EMAIL);
            formData.append("Submitted Page", window.location.href);
            formData.append("Submitted At", new Date().toLocaleString());

            const response = await fetch(WEB3FORMS_ENDPOINT, {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Unable to submit the form.");
            }

            careRequestForm.reset();
            clearSmsError();

            openSuccessModal(
                "Thank you for submitting!",
                "Our team will contact you soon."
            );
        } catch (error) {
            console.error("Form submission error:", error);
            openSuccessModal(
                "Submission failed",
                "Sorry, something went wrong. Please call us directly or try again later."
            );
        } finally {
            isSubmitting = false;
            setSubmitLoading(false);
        }
    }

    function getInputValue(id) {
        const input = document.getElementById(id);
        return input ? input.value.trim() : "";
    }

    function setSubmitLoading(isLoading) {
        if (!submitBtn) return;
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.classList.add("loading");
            submitBtn.innerHTML = `<span class="btn-spinner"></span> Submitting...`;
        } else {
            submitBtn.disabled = false;
            submitBtn.classList.remove("loading");
            submitBtn.innerHTML = `Submit Request <i class="fa-solid fa-paper-plane"></i>`;
        }
    }

    /* =====================================================
       SUCCESS / MESSAGE MODAL CONTROLS
    ===================================================== */
    function openSuccessModal(title, message) {
        if (!successModal) return;

        const modalTitle = successModal.querySelector("h2");
        const modalText = successModal.querySelector("p");

        if (modalTitle && title) modalTitle.textContent = title;
        if (modalText && message) modalText.textContent = message;

        successModal.classList.add("active");
        body.style.overflow = "hidden";
    }

    function closeSuccessModal() {
        if (!successModal) return;
        successModal.classList.remove("active");
        body.style.overflow = "";
    }

    if (modalClose) modalClose.addEventListener("click", closeSuccessModal);
    if (modalDoneBtn) modalDoneBtn.addEventListener("click", closeSuccessModal);

    if (successModal) {
        successModal.addEventListener("click", function (event) {
            if (event.target === successModal) {
                closeSuccessModal();
            }
        });
    }

    /* =====================================================
       NEWSLETTER FORM MECHANISM
    ===================================================== */
    if (newsletterForm) {
        newsletterForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const newsletterInput = newsletterForm.querySelector("input[type='email']");
            if (!newsletterInput) return;

            const email = newsletterInput.value.trim();

            if (!email || !isValidEmail(email)) {
                newsletterInput.classList.add("input-error");
                newsletterInput.focus();
                setTimeout(function () {
                    newsletterInput.classList.remove("input-error");
                }, 1400);
                return;
            }

            newsletterInput.value = "";
            openSuccessModal(
                "Thank you for subscribing!",
                "You are now connected with Michigan Family Caregiver LLC updates."
            );
        });
    }

    /* =====================================================
       SCROLL REVEAL ANIMATION ENGINE
    ===================================================== */
    const revealSelector = [
        ".program-card", ".service-card", ".eligibility-card", ".support-item",
        ".testimonial-card", ".contact-info-card", ".form-card", ".service-hero-card",
        ".contact-hero-info", ".career-hero-card", ".resources-hero-card", ".service-detail-card",
        ".daily-support-card", ".process-card", ".faq-card", ".area-card",
        ".career-benefit-card", ".career-role-card", ".resource-topic-card", ".quality-list-card",
        ".care-tips-list"
    ].join(", ");

    const revealElements = document.querySelectorAll(revealSelector);

    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("reveal-visible");
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 }
        );

        revealElements.forEach(function (element) {
            element.classList.add("reveal-hidden");
            revealObserver.observe(element);
        });
    } else {
        revealElements.forEach(function (element) {
            element.classList.add("reveal-visible");
        });
    }

    /* =====================================================
       SMOOTH HASH SCROLL CONTROL
    ===================================================== */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener("click", function (event) {
            const targetId = anchor.getAttribute("href");
            if (!targetId || targetId === "#") return;

            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;

            event.preventDefault();
            closeMobileMenu();

            targetElement.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });
});
