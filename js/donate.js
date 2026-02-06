(cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF'
diff --git a/js/donate.js b/js/donate.js
--- a/js/donate.js
+++ b/js/donate.js
@@ -0,0 +1,346 @@
+// Donation functionality for bultimore.com
+document.addEventListener('DOMContentLoaded', function() {
+    initializeDonationForm();
+    loadRecentDonors();
+    updateDonationProgress();
+});
+
+function initializeDonationForm() {
+    // Set up amount selection
+    const amountInput = document.getElementById('donation-amount');
+    const amountButtons = document.querySelectorAll('.amount-btn');
+    
+    // Handle preset amount selection
+    window.selectAmount = function(amount) {
+        amountInput.value = amount;
+        
+        // Update button states
+        amountButtons.forEach(btn => btn.classList.remove('active'));
+        event.target.classList.add('active');
+    };
+
+    // Clear preset selection when custom amount is entered
+    if (amountInput) {
+        amountInput.addEventListener('input', function() {
+            amountButtons.forEach(btn => btn.classList.remove('active'));
+        });
+    }
+
+    // Handle recurring donation display
+    const recurringCheckbox = document.querySelector('input[name="recurring"]');
+    if (recurringCheckbox) {
+        recurringCheckbox.addEventListener('change', function() {
+            toggleRecurringHighlight(this.checked);
+        });
+    }
+}
+
+function toggleRecurringHighlight(isRecurring) {
+    let highlight = document.querySelector('.recurring-highlight');
+    
+    if (isRecurring && !highlight) {
+        highlight = document.createElement('div');
+        highlight.className = 'recurring-highlight';
+        highlight.innerHTML = `
+            <h4><i class="fas fa-sync-alt"></i> Monthly Donation</h4>
+            <p>You've chosen to make this a recurring monthly donation. You can cancel anytime.</p>
+        `;
+        
+        const paymentMethod = document.querySelector('.payment-method');
+        paymentMethod.parentNode.insertBefore(highlight, paymentMethod);
+    } else if (!isRecurring && highlight) {
+        highlight.remove();
+    }
+}
+
+function processDonation(event) {
+    event.preventDefault();
+    
+    const form = event.target;
+    if (!validateForm(form)) {
+        showMessage('Please fill in all required fields', 'error');
+        return;
+    }
+
+    const formData = new FormData(form);
+    const amount = parseFloat(formData.get('amount'));
+    
+    if (!amount || amount < 1) {
+        showMessage('Please enter a valid donation amount', 'error');
+        return;
+    }
+
+    const donationData = {
+        amount: amount,
+        fullName: formData.get('fullName'),
+        email: formData.get('email'),
+        phone: formData.get('phone'),
+        message: formData.get('message'),
+        paymentMethod: formData.get('paymentMethod'),
+        recurring: formData.get('recurring') === 'monthly',
+        anonymous: formData.get('anonymous') === 'true',
+        newsletter: formData.get('newsletter') === 'true'
+    };
+
+    // Show processing state
+    const submitBtn = form.querySelector('.donate-submit-btn');
+    const originalText = submitBtn.innerHTML;
+    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
+    submitBtn.disabled = true;
+
+    // Simulate processing delay
+    setTimeout(() => {
+        if (donationData.paymentMethod === 'mobile_money' || donationData.paymentMethod === 'bank_transfer') {
+            initiateFlutterwaveDonation(donationData);
+        } else {
+            processCardDonation(donationData);
+        }
+        
+        // Reset button
+        submitBtn.innerHTML = originalText;
+        submitBtn.disabled = false;
+    }, 1000);
+}
+
+function initiateFlutterwaveDonation(donationData) {
+    FlutterwaveCheckout({
+        public_key: "FLWPUBK_TEST-XXXXX", // Replace with actual public key
+        tx_ref: "donation-" + Date.now(),
+        amount: donationData.amount,
+        currency: "USD",
+        payment_options: donationData.paymentMethod === 'mobile_money' ? "mobilemoney" : "banktransfer",
+        customer: {
+            email: donationData.email,
+            phone_number: donationData.phone,
+            name: donationData.fullName,
+        },
+        customizations: {
+            title: "Support bultimore",
+            description: "Donation to support our mission",
+            logo: "https://your-logo-url.com/logo.png",
+        },
+        callback: function (data) {
+            console.log(data);
+            if (data.status === "successful") {
+                handleSuccessfulDonation(data, donationData);
+            } else {
+                handleFailedDonation(data);
+            }
+        },
+        onclose: function() {
+            console.log("Donation modal closed");
+        }
+    });
+}
+
+function processCardDonation(donationData) {
+    // For demo purposes, simulate successful donation
+    setTimeout(() => {
+        const mockResponse = {
+            status: "successful",
+            transaction_id: "donation-mock-" + Date.now(),
+            amount: donationData.amount
+        };
+        handleSuccessfulDonation(mockResponse, donationData);
+    }, 2000);
+}
+
+function handleSuccessfulDonation(response, donationData) {
+    // Save donation record
+    const donation = {
+        id: response.transaction_id,
+        ...donationData,
+        status: 'completed',
+        date: new Date().toISOString()
+    };
+    
+    const donations = JSON.parse(localStorage.getItem('bultimore_donations')) || [];
+    donations.push(donation);
+    localStorage.setItem('bultimore_donations', JSON.stringify(donations));
+    
+    // Update recent donors display
+    updateRecentDonors(donation);
+    
+    // Show success message
+    showDonationSuccess(donation);
+    
+    // Reset form
+    document.getElementById('donation-form').reset();
+    document.querySelectorAll('.amount-btn').forEach(btn => btn.classList.remove('active'));
+    
+    // Remove recurring highlight if present
+    const highlight = document.querySelector('.recurring-highlight');
+    if (highlight) highlight.remove();
+    
+    console.log('Donation completed:', donation);
+}
+
+function handleFailedDonation(response) {
+    showMessage('Donation failed. Please try again.', 'error');
+    console.error('Donation failed:', response);
+}
+
+function showDonationSuccess(donation) {
+    const modal = document.createElement('div');
+    modal.className = 'modal';
+    modal.style.display = 'block';
+    modal.innerHTML = `
+        <div class="modal-content">
+            <span class="modal-close" onclick="this.closest('.modal').remove()">&times;</span>
+            <div class="donation-success">
+                <i class="fas fa-heart"></i>
+                <h3>Thank You!</h3>
+                <p>Your generous donation of <strong>$${donation.amount}</strong> means the world to us.</p>
+                ${donation.recurring ? '<p><em>You will be charged monthly until you cancel.</em></p>' : ''}
+                <p>You will receive a confirmation email shortly.</p>
+                <p><strong>Donation ID:</strong> ${donation.id}</p>
+                <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Continue</button>
+            </div>
+        </div>
+    `;
+    
+    document.body.appendChild(modal);
+    
+    // Auto-remove after 15 seconds
+    setTimeout(() => {
+        if (modal.parentNode) {
+            modal.parentNode.removeChild(modal);
+        }
+    }, 15000);
+}
+
+function loadRecentDonors() {
+    const donations = JSON.parse(localStorage.getItem('bultimore_donations')) || [];
+    const recentDonations = donations
+        .filter(d => d.status === 'completed')
+        .sort((a, b) => new Date(b.date) - new Date(a.date))
+        .slice(0, 3);
+    
+    updateRecentDonorsDisplay(recentDonations);
+}
+
+function updateRecentDonors(newDonation) {
+    const donations = JSON.parse(localStorage.getItem('bultimore_donations')) || [];
+    const recentDonations = donations
+        .filter(d => d.status === 'completed')
+        .sort((a, b) => new Date(b.date) - new Date(a.date))
+        .slice(0, 3);
+    
+    updateRecentDonorsDisplay(recentDonations);
+}
+
+function updateRecentDonorsDisplay(donations) {
+    const container = document.querySelector('.recent-donors');
+    if (!container) return;
+
+    if (donations.length === 0) {
+        container.innerHTML = `
+            <div class="donor-item">
+                <strong>Be the first!</strong> No donations yet
+                <small>Help us get started</small>
+            </div>
+        `;
+        return;
+    }
+
+    container.innerHTML = donations.map(donation => {
+        const displayName = donation.anonymous ? 'Anonymous' : donation.fullName;
+        const timeAgo = getTimeAgo(new Date(donation.date));
+        
+        return `
+            <div class="donor-item">
+                <strong>${displayName}</strong> donated $${donation.amount}
+                <small>${timeAgo}</small>
+            </div>
+        `;
+    }).join('');
+}
+
+function updateDonationProgress() {
+    // This would typically come from a backend API
+    // For demo purposes, calculate from local storage
+    const donations = JSON.parse(localStorage.getItem('bultimore_donations')) || [];
+    const totalRaised = donations
+        .filter(d => d.status === 'completed')
+        .reduce((sum, d) => sum + d.amount, 0);
+    
+    const goal = 1000; // $1000 monthly goal
+    const progress = Math.min((totalRaised / goal) * 100, 100);
+    
+    // Update progress display if it exists
+    const progressContainer = document.querySelector('.donation-progress');
+    if (progressContainer) {
+        progressContainer.innerHTML = `
+            <div class="progress-info">
+                <span>Monthly Goal Progress</span>
+                <span>$${totalRaised.toFixed(2)} / $${goal}</span>
+            </div>
+            <div class="progress-bar-container">
+                <div class="progress-bar-fill" style="width: ${progress}%"></div>
+            </div>
+        `;
+    }
+}
+
+function getTimeAgo(date) {
+    const now = new Date();
+    const diffInMs = now - date;
+    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
+    const diffInDays = Math.floor(diffInHours / 24);
+    
+    if (diffInHours < 1) {
+        return 'Just now';
+    } else if (diffInHours < 24) {
+        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
+    } else if (diffInDays < 7) {
+        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
+    } else {
+        return date.toLocaleDateString();
+    }
+}
+
+// Social sharing for donation campaigns
+function shareDonationCampaign() {
+    const shareData = {
+        title: 'Support bultimore',
+        text: 'Help support art, creativity, and community at bultimore.com',
+        url: window.location.href
+    };
+
+    if (navigator.share) {
+        navigator.share(shareData);
+    } else {
+        // Fallback: copy to clipboard
+        navigator.clipboard.writeText(shareData.url).then(() => {
+            showMessage('Donation page link copied to clipboard!', 'success');
+        });
+    }
+}
+
+// Donation analytics (for admin)
+function getDonationStats() {
+    const donations = JSON.parse(localStorage.getItem('bultimore_donations')) || [];
+    const completedDonations = donations.filter(d => d.status === 'completed');
+    
+    const stats = {
+        totalDonations: completedDonations.length,
+        totalAmount: completedDonations.reduce((sum, d) => sum + d.amount, 0),
+        averageDonation: completedDonations.length > 0 ? 
+            completedDonations.reduce((sum, d) => sum + d.amount, 0) / completedDonations.length : 0,
+        recurringDonors: completedDonations.filter(d => d.recurring).length,
+        topDonation: Math.max(...completedDonations.map(d => d.amount), 0),
+        recentDonations: completedDonations
+            .sort((a, b) => new Date(b.date) - new Date(a.date))
+            .slice(0, 10)
+    };
+    
+    return stats;
+}
+
+// Export for admin dashboard
+window.donationManager = {
+    getDonationStats,
+    loadRecentDonors,
+    updateDonationProgress,
+    shareDonationCampaign
+};
EOF
)