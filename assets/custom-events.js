(function () {
  var desktopHover = window.matchMedia('(hover: hover) and (pointer: fine)');

  function directChild(parent, selector) {
    for (var i = 0; i < parent.children.length; i += 1) {
      if (parent.children[i].matches(selector)) {
        return parent.children[i];
      }
    }

    return null;
  }

  function closeSubmenu(parent) {
    var submenu = directChild(parent, '[data-submenu]');
    var trigger = directChild(parent, '[data-link]');

    if (!submenu || !trigger) return;

    submenu.classList.remove('active');
    submenu.setAttribute('aria-hidden', 'true');
    trigger.setAttribute('aria-expanded', 'false');

    submenu.querySelectorAll('[data-submenu].active').forEach(function (childSubmenu) {
      childSubmenu.classList.remove('active');
      childSubmenu.setAttribute('aria-hidden', 'true');
    });

    submenu.querySelectorAll('[data-parent][aria-expanded="true"]').forEach(function (childTrigger) {
      childTrigger.setAttribute('aria-expanded', 'false');
    });
  }

  function closeSiblings(parent) {
    var list = parent.parentElement;

    if (!list) return;

    Array.prototype.forEach.call(list.children, function (sibling) {
      if (sibling !== parent && sibling.hasAttribute('data-submenu-parent')) {
        closeSubmenu(sibling);
      }
    });
  }

  function openSubmenu(parent) {
    clearTimeout(parent.hoverDropdownCloseTimer);

    var submenu = directChild(parent, '[data-submenu]');
    var trigger = directChild(parent, '[data-link]');

    if (!submenu || !trigger) return;

    closeSiblings(parent);
    submenu.classList.add('active');
    submenu.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');
  }

  function scheduleCloseSubmenu(parent) {
    clearTimeout(parent.hoverDropdownCloseTimer);

    parent.hoverDropdownCloseTimer = setTimeout(function () {
      closeSubmenu(parent);
    }, 260);
  }

  function initHoverNavigation() {
    if (!desktopHover.matches) return;

    document.querySelectorAll('[data-navigation] [data-submenu-parent]').forEach(function (parent) {
      if (parent.dataset.hoverDropdownInitialized === 'true') return;

      parent.dataset.hoverDropdownInitialized = 'true';
      parent.addEventListener('mouseenter', function () {
        openSubmenu(parent);
      });

      parent.addEventListener('mouseleave', function () {
        scheduleCloseSubmenu(parent);
      });
    });
  }

  function formatCartMoney(amount) {
    var currency = window.Shopify && window.Shopify.currency
      ? window.Shopify.currency.active
      : 'USD';

    return new Intl.NumberFormat(document.documentElement.lang || 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount / 100);
  }

  function updateFreeShippingProgress(cart) {
    if (!cart) return;

    document.querySelectorAll('[data-free-shipping-progress]').forEach(function (progress) {
      var threshold = Number(progress.dataset.threshold);
      var total = Number(cart.total_price || 0);
      var remaining = Math.max(threshold - total, 0);
      var percentage = threshold > 0 ? Math.min((total / threshold) * 100, 100) : 100;
      var message = progress.querySelector('[data-free-shipping-message]');
      var fill = progress.querySelector('[data-free-shipping-fill]');
      var current = progress.querySelector('[data-free-shipping-current]');
      var track = progress.querySelector('[role="progressbar"]');
      var drawer = progress.closest('[data-quick-cart]');
      var cartTotal = drawer && drawer.querySelector('[data-cart-total]');

      if (message) {
        message.textContent = remaining > 0
          ? "You're " + formatCartMoney(remaining) + ' away from complimentary shipping.'
          : "You've unlocked complimentary shipping.";
      }

      if (fill) fill.style.width = percentage + '%';
      if (current) current.textContent = formatCartMoney(total);
      if (track) track.setAttribute('aria-valuenow', Math.round(percentage));
      if (cartTotal) cartTotal.textContent = formatCartMoney(total);
    });
  }

  function enhanceQuickCartItems() {
    document.querySelectorAll('[data-quick-cart] .quick-cart__item').forEach(function (item) {
      var controls = item.querySelector('.quick-cart__control-top');
      var quantity = controls && controls.querySelector('[data-quick-cart-quantity]');

      if (!controls) return;

      if (!quantity) {
        quantity = document.createElement('span');
        quantity.className = 'quick-cart__quantity-value';
        quantity.setAttribute('data-quick-cart-quantity', '');
        quantity.setAttribute('aria-label', 'Quantity');
        controls.appendChild(quantity);
      }

      quantity.textContent = item.dataset.quantity || '1';
    });
  }

  document.addEventListener('cart:updated', function (event) {
    updateFreeShippingProgress(event.detail && event.detail.cart);
    enhanceQuickCartItems();
  });

  document.addEventListener('quick-cart:open', function (event) {
    updateFreeShippingProgress(event.detail && event.detail.cart);
    enhanceQuickCartItems();
  });

  document.addEventListener('click', function (event) {
    var toggle = event.target.closest('[data-payment-options-toggle]');

    if (!toggle) return;

    var options = document.getElementById(toggle.getAttribute('aria-controls'));
    var isOpen = toggle.getAttribute('aria-expanded') === 'true';

    if (!options) return;

    toggle.setAttribute('aria-expanded', String(!isOpen));
    options.setAttribute('aria-hidden', String(isOpen));
    options.classList.toggle('is-open', !isOpen);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter') return;

    var input = event.target.closest('.klaviyo-form-TtLnSs input[type="email"]');
    if (!input) return;

    var form = input.closest('.klaviyo-form-TtLnSs');
    var submit = form && form.querySelector('button');

    if (!submit || submit.disabled) return;

    event.preventDefault();
    submit.click();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHoverNavigation);
  } else {
    initHoverNavigation();
  }
})();
