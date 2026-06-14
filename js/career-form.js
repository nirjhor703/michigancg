/* =========================================================
   CAREGIVER APPLICATION FORM TO GOOGLE SHEET + DRIVE
   File: js/career-form.js
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzc0ocj03hvcUcgcW_tLRfyeCx9cFC0Gzagommo0XxRY8UmQtm-sdiWvVFhYAv43hE1mw/exec";

    const MAX_FILE_SIZE_MB = 5;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    const ALLOWED_FILE_TYPES = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png"
    ];

    const form = document.getElementById("caregiverApplicationForm");
    const submitBtn = document.getElementById("caregiverApplicationSubmitBtn");

    if (!form) return;

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const isValid = validateApplicationForm();

        if (!isValid) {
            scrollToFirstError();
            return;
        }

        try {
            setSubmitLoading(true);

            const payload = await buildApplicationPayload();

            await fetch(GOOGLE_SCRIPT_URL, {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "text/plain;charset=utf-8"
                },
                body: JSON.stringify(payload)
            });

            form.reset();

            showModal(
                "Application submitted!",
                "Thank you. Your caregiver application and uploaded documents have been submitted successfully."
            );

        } catch (error) {
            console.error("Application submit error:", error);

            showModal(
                "Submission failed",
                error.message || "Something went wrong. Please try again."
            );

        } finally {
            setSubmitLoading(false);
        }
    });


    /* =====================================================
       BUILD PAYLOAD
    ===================================================== */

    async function buildApplicationPayload() {
        const formData = new FormData(form);
        const payload = {};
        const files = [];

        payload["Page URL"] = window.location.href;
        payload["Browser Time"] = new Date().toLocaleString();

        for (const [rawName, value] of formData.entries()) {
            const fieldName = cleanFieldName(rawName);

            if (value instanceof File) {
                if (!value.name) continue;

                validateFile(value);

                const fileData = await fileToBase64Object(value, fieldName);
                files.push(fileData);

                continue;
            }

            const cleanValue = String(value).trim();

            if (cleanValue) {
                addPayloadValue(payload, fieldName, cleanValue);
            }
        }

        payload.files = files;

        return payload;
    }

    function cleanFieldName(name) {
        return String(name)
            .replace(/\[\]/g, "")
            .replace(/\s+/g, " ")
            .trim();
    }

    function addPayloadValue(payload, key, value) {
        if (!payload[key]) {
            payload[key] = value;
            return;
        }

        payload[key] = `${payload[key]}, ${value}`;
    }


    /* =====================================================
       FILE HELPERS
    ===================================================== */

    function validateFile(file) {
        if (file.size > MAX_FILE_SIZE_BYTES) {
            throw new Error(`${file.name} is too large. Maximum file size is ${MAX_FILE_SIZE_MB}MB.`);
        }

        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            throw new Error(`${file.name} is not supported. Please upload PDF, DOC, DOCX, JPG, JPEG, or PNG.`);
        }
    }

    function fileToBase64Object(file, fieldName) {
        return new Promise(function (resolve, reject) {
            const reader = new FileReader();

            reader.onload = function () {
                const result = reader.result;
                const base64 = String(result).split(",")[1];

                resolve({
                    fieldName: fieldName,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    base64: base64
                });
            };

            reader.onerror = function () {
                reject(new Error(`Failed to read file: ${file.name}`));
            };

            reader.readAsDataURL(file);
        });
    }


    /* =====================================================
       VALIDATION
    ===================================================== */

    function validateApplicationForm() {
        let isValid = true;

        clearErrors();

        // নতুন মডিফাইড ফর্মের সাথে ম্যাচিং রিকোয়ার্ড ফিল্ডস
        const requiredFields = [
            { id: "firstName", label: "First name" },
            { id: "lastName", label: "Last name" },
            { id: "dob", label: "Date of birth" },
            { id: "mobilePhone", label: "Phone number" },
            { id: "applicantEmail", label: "Email address" },
            { id: "addressLine1", label: "Address line 1" },
            { id: "zipCode", label: "Zip code" },
            { id: "city", label: "City" },
            { id: "state", label: "State" },
            { id: "country", label: "Country" },
            { id: "signatureName", label: "Applicant full name" },
            { id: "signatureDate", label: "Signature date" }
        ];

        requiredFields.forEach(function (field) {
            const input = document.getElementById(field.id);

            if (!input) return;

            if (!input.value.trim()) {
                showFieldError(input, `${field.label} is required.`);
                isValid = false;
            }
        });

        // ইমেইল ভ্যালিডেশন
        const emailInput = document.getElementById("applicantEmail");
        if (emailInput && emailInput.value.trim() && !isValidEmail(emailInput.value.trim())) {
            showFieldError(emailInput, "Please enter a valid email address.");
            isValid = false;
        }

        // ফোন ভ্যালিডেশন
        const phoneInput = document.getElementById("mobilePhone");
        if (phoneInput && phoneInput.value.trim() && !isValidPhone(phoneInput.value.trim())) {
            showFieldError(phoneInput, "Please enter a valid phone number.");
            isValid = false;
        }

        // কনসেন্ট/এগ্রিমেন্ট চেক
        const agreement = form.querySelector('input[name="Applicant Consent"]');
        if (agreement && !agreement.checked) {
            showModal(
                "Consent Required",
                "Please check the box to certify that the information provided is true and complete."
            );
            isValid = false;
        }

        // ফাইল ইনপুট ভ্যালিডেশন (CV এবং ID Proof)
        const fileInputs = form.querySelectorAll('input[type="file"]');
        fileInputs.forEach(function (input) {
            if (input.required && input.files.length === 0) {
                showFieldError(input, "This document is required.");
                isValid = false;
            }

            Array.from(input.files).forEach(function (file) {
                try {
                    validateFile(file);
                } catch (error) {
                    showFieldError(input, error.message);
                    isValid = false;
                }
            });
        });

        return isValid;
    }

    function showFieldError(input, message) {
        input.classList.add("input-error");

        const formGroup = input.closest(".form-group");
        if (formGroup) {
            const error = formGroup.querySelector(".field-error");
            if (error) {
                error.textContent = message;
            }
        }
    }

    function clearErrors() {
        form.querySelectorAll(".input-error").forEach(function (input) {
            input.classList.remove("input-error");
        });

        form.querySelectorAll(".field-error").forEach(function (error) {
            error.textContent = "";
        });
    }

    function scrollToFirstError() {
        const firstError = form.querySelector(".input-error");
        if (!firstError) return;

        firstError.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        setTimeout(function () {
            firstError.focus();
        }, 350);
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidPhone(phone) {
        return /^[0-9+\-\s().]{7,20}$/.test(phone);
    }


    /* =====================================================
       LOADING BUTTON
    ===================================================== */

    function setSubmitLoading(isLoading) {
        if (!submitBtn) return;

        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.classList.add("loading");
            submitBtn.innerHTML = `
                <span class="btn-spinner"></span>
                Uploading & Submitting...
            `;
        } else {
            submitBtn.disabled = false;
            submitBtn.classList.remove("loading");
            submitBtn.innerHTML = `
                Submit Application
                <i class="fa-solid fa-paper-plane"></i>
            `;
        }
    }


    /* =====================================================
       MODAL
    ===================================================== */

    function showModal(title, message) {
        const modal = document.getElementById("successModal");

        if (!modal) {
            alert(`${title}\n${message}`);
            return;
        }

        const modalTitle = modal.querySelector("h2");
        const modalText = modal.querySelector("p");

        if (modalTitle) modalTitle.textContent = title;
        if (modalText) modalText.textContent = message;

        modal.classList.add("active");
        document.body.style.overflow = "hidden";
    }
});