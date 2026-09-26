/**
 * Roles y permisos del panel Colaboradores.
 * admin = acceso total (*). Otros roles se definen cuando existan.
 */
(function (global) {
    'use strict';

    const ROLE_DEFS = {
        admin: {
            id: 'admin',
            label: 'Administrador',
            /** Acceso total a secciones y acciones privilegiadas */
            access: '*'
        },
        /**
         * Provisional (credencial legacy). Cuando exista el rol POS
         * se redefine qué secciones/acciones puede usar.
         */
        ventas: {
            id: 'ventas',
            label: 'Ventas',
            access: ['dashboard', 'venta', 'clients', 'cobranza', 'salesHistory', 'cortes', 'dinero', 'products', 'prices', 'materials']
        }
    };

    const LEGACY_SECTION_MAP = {
        prices: 'products',
        catalog: 'products',
        formulas: 'products',
        site: 'dashboard'
    };

    function normalizeRole(role) {
        const r = String(role || '').toLowerCase().trim();
        if (ROLE_DEFS[r]) return r;
        // Rol desconocido → mínimo privilegio (no escalar a admin).
        return 'ventas';
    }

    function roleDef(role) {
        return ROLE_DEFS[normalizeRole(role)] || ROLE_DEFS.admin;
    }

    function roleLabel(role) {
        return roleDef(role).label;
    }

    function isFullAccess(role) {
        return roleDef(role).access === '*';
    }

    function resolveSection(section) {
        const id = String(section || '');
        return LEGACY_SECTION_MAP[id] || id;
    }

    function canAccess(role, section) {
        const def = roleDef(role);
        if (def.access === '*') return true;
        const sec = resolveSection(section);
        return Array.isArray(def.access) && def.access.indexOf(sec) >= 0;
    }

    function listRoles() {
        return Object.keys(ROLE_DEFS).map(function (id) {
            return Object.assign({}, ROLE_DEFS[id]);
        });
    }

    /**
     * Sesión actual desde localStorage (post-login).
     * @returns {{ id: string, username: string, name: string, role: string }}
     */
    function readSessionUser() {
        let raw = {};
        try {
            raw = JSON.parse(localStorage.getItem('s35_admin_user') || '{}') || {};
        } catch (_) {
            raw = {};
        }
        const username = String(raw.username || raw.sub || 'admin').trim().toLowerCase() || 'admin';
        const role = normalizeRole(raw.role);
        const name = String(raw.name || raw.displayName || username).trim() || username;
        const id = String(raw.id || username);
        return { id: id, username: username, name: name, role: role };
    }

    /** Snapshot para guardar en tickets (inmutable al momento de la venta). */
    function userSnapshotForSale(user) {
        const u = user || readSessionUser();
        return {
            id: u.id,
            username: u.username,
            name: u.name,
            role: u.role
        };
    }

    /** Lee vendedor de un ticket (objeto nuevo o string legacy). */
    function saleUserLabel(sale) {
        if (!sale) return '';
        const u = sale.user;
        if (u && typeof u === 'object') {
            return String(u.name || u.username || u.id || '').trim();
        }
        if (typeof u === 'string' && u.trim()) return u.trim();
        if (sale.userName) return String(sale.userName).trim();
        if (sale.username) return String(sale.username).trim();
        return '';
    }

    global.S35Roles = {
        DEFS: ROLE_DEFS,
        normalizeRole: normalizeRole,
        roleDef: roleDef,
        roleLabel: roleLabel,
        isFullAccess: isFullAccess,
        canAccess: canAccess,
        resolveSection: resolveSection,
        listRoles: listRoles,
        readSessionUser: readSessionUser,
        userSnapshotForSale: userSnapshotForSale,
        saleUserLabel: saleUserLabel
    };
})(typeof window !== 'undefined' ? window : globalThis);
