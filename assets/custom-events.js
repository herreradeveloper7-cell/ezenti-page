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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHoverNavigation);
  } else {
    initHoverNavigation();
  }
})();
