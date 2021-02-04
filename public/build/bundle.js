
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.32.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't {"env":{"isProd":false}} other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function regexparam (str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules/svelte-spa-router/Router.svelte generated by Svelte v3.32.1 */

    const { Error: Error_1, Object: Object_1, console: console_1 } = globals;

    // (209:0) {:else}
    function create_else_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(209:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (202:0) {#if componentParams}
    function create_if_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(202:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap$1(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn("Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading");

    	return wrap({ component, userData, conditions });
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf("#/");

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: "/";

    	// Check if there's a querystring
    	const qsPosition = location.indexOf("?");

    	let querystring = "";

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener("hashchange", update, false);

    	return function stop() {
    		window.removeEventListener("hashchange", update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			scrollX: window.scrollX,
    			scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == "#" ? "" : "#") + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == "#" ? "" : "#") + location;

    	try {
    		window.history.replaceState(undefined, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn("Caught exception while replacing the current page. If you're running this in the Svelte REPL, please note that the `replace` method might not work in this environment.");
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event("hashchange"));
    }

    function link(node, hrefVar) {
    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != "a") {
    		throw Error("Action \"link\" can only be used with <a> tags");
    	}

    	updateLink(node, hrefVar || node.getAttribute("href"));

    	return {
    		update(updated) {
    			updateLink(node, updated);
    		}
    	};
    }

    // Internal function used by the link function
    function updateLink(node, href) {
    	// Destination must start with '/'
    	if (!href || href.length < 1 || href.charAt(0) != "/") {
    		throw Error("Invalid value for \"href\" attribute: " + href);
    	}

    	// Add # to the href attribute
    	node.setAttribute("href", "#" + href);

    	node.addEventListener("click", scrollstateHistoryHandler);
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {HTMLElementEventMap} event - an onclick event attached to an anchor tag
     */
    function scrollstateHistoryHandler(event) {
    	// Prevent default anchor onclick behaviour
    	event.preventDefault();

    	const href = event.currentTarget.getAttribute("href");

    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			scrollX: window.scrollX,
    			scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = "" } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != "function" && (typeof component != "object" || component._sveltesparouter !== true)) {
    				throw Error("Invalid component object");
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == "string" && (path.length < 1 || path.charAt(0) != "/" && path.charAt(0) != "*") || typeof path == "object" && !(path instanceof RegExp)) {
    				throw Error("Invalid value for \"path\" argument - strings must start with / or *");
    			}

    			const { pattern, keys } = regexparam(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == "object" && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, check if it matches the start of the path.
    			// If not, bail early, else remove it before we run the matching.
    			if (prefix) {
    				if (typeof prefix == "string") {
    					if (path.startsWith(prefix)) {
    						path = path.substr(prefix.length) || "/";
    					} else {
    						return null;
    					}
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || "/";
    					} else {
    						return null;
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || "") || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {bool} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	if (restoreScrollState) {
    		window.addEventListener("popstate", event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && event.state.scrollY) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		});

    		afterUpdate(() => {
    			// If this exists, then this is a back navigation: restore the scroll position
    			if (previousScrollState) {
    				window.scrollTo(previousScrollState.scrollX, previousScrollState.scrollY);
    			} else {
    				// Otherwise this is a forward navigation: scroll to top
    				window.scrollTo(0, 0);
    			}
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick("conditionsFailed", detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoading", Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick("routeLoaded", Object.assign({}, detail, { component, name: component.name }));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == "object" && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoaded", Object.assign({}, detail, { component, name: component.name }));

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    	});

    	const writable_props = ["routes", "prefix", "restoreScrollState"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble($$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		derived,
    		tick,
    		_wrap: wrap,
    		wrap: wrap$1,
    		getLocation,
    		loc,
    		location,
    		querystring,
    		push,
    		pop,
    		replace,
    		link,
    		updateLink,
    		scrollstateHistoryHandler,
    		createEventDispatcher,
    		afterUpdate,
    		regexparam,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		lastLoc,
    		componentObj
    	});

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ("component" in $$props) $$invalidate(0, component = $$props.component);
    		if ("componentParams" in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ("props" in $$props) $$invalidate(2, props = $$props.props);
    		if ("previousScrollState" in $$props) previousScrollState = $$props.previousScrollState;
    		if ("lastLoc" in $$props) lastLoc = $$props.lastLoc;
    		if ("componentObj" in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			 history.scrollRestoration = restoreScrollState ? "manual" : "auto";
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src/components/ContentWrapper.svelte generated by Svelte v3.32.1 */
    const file = "src/components/ContentWrapper.svelte";

    function create_fragment$1(ctx) {
    	let div1;
    	let div0;
    	let div1_intro;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "bg-white py-8 px-4 shadow rounded-sm sm:rounded-lg sm:px-10");
    			add_location(div0, file, 5, 2, 142);
    			attr_dev(div1, "local", "");
    			attr_dev(div1, "class", "mt-8 mb-2 mx-5 sm:mx-auto sm:w-full sm:max-w-md");
    			add_location(div1, file, 4, 0, 64);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			if (!div1_intro) {
    				add_render_callback(() => {
    					div1_intro = create_in_transition(div1, fade, {});
    					div1_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ContentWrapper", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ContentWrapper> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ fade });
    	return [$$scope, slots];
    }

    class ContentWrapper extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContentWrapper",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/components/AppHeader.svelte generated by Svelte v3.32.1 */
    const file$1 = "src/components/AppHeader.svelte";

    function create_fragment$2(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let h2;
    	let t2;
    	let div1;
    	let p;
    	let div2_intro;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t0 = space();
    			h2 = element("h2");
    			h2.textContent = "2021 Habit Challenge";
    			t2 = space();
    			div1 = element("div");
    			p = element("p");
    			p.textContent = "Take twenty-one days to make a habit";
    			attr_dev(div0, "class", "mx-auto w-48 sm:w-64");
    			add_location(div0, file$1, 5, 2, 127);
    			attr_dev(h2, "class", "mt-6 text-center text-3xl font-extrabold text-gray-900");
    			add_location(h2, file$1, 8, 2, 186);
    			attr_dev(p, "class", "font-medium text-blue-600 hover:text-blue-500");
    			add_location(p, file$1, 12, 4, 352);
    			attr_dev(div1, "class", "mt-2 text-center text-sm text-gray-600 max-w");
    			add_location(div1, file$1, 11, 2, 289);
    			attr_dev(div2, "local", "");
    			attr_dev(div2, "class", "sm:mx-auto sm:w-full sm:max-w-md");
    			add_location(div2, file$1, 4, 0, 64);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			append_dev(div2, t0);
    			append_dev(div2, h2);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, p);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			if (!div2_intro) {
    				add_render_callback(() => {
    					div2_intro = create_in_transition(div2, fade, {});
    					div2_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AppHeader", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AppHeader> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ fade });
    	return [$$scope, slots];
    }

    class AppHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AppHeader",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/svg/error.svelte generated by Svelte v3.32.1 */

    const { Error: Error_1$1 } = globals;
    const file$2 = "src/svg/error.svelte";

    function create_fragment$3(ctx) {
    	let svg;
    	let g1;
    	let g0;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			attr_dev(path0, "d", "M258.11,2.27l.57.57v79a.51.51,0,0,1-.57.57V83a.5.5,0,0,1-.57.57v.57L242.19,98.92v.57h-.57l-.56.57h-141v58.56H257v.57h.57l.57.57v.56c0,.39.09.57.29.57s.28.2.28.57v79l-.57.57v.56l-.57.57-15.35,15.35v.57H100.06v58.56H255.84l.57.57h1.13v.57l.57.57v.56l.57.57v79.6l-.57.56a1.61,1.61,0,0,1-.57,1.14l-15.35,15.35h-.57v.57H1.71v-.57H1.14l-.57-.57V415H0v-398H.57v-.57l.57-.57L15.92.57a1.13,1.13,0,0,0,.85-.29A2.32,2.32,0,0,1,18.19,0H257V.57h.57a.5.5,0,0,0,.57.57V2.27ZM20.47,9.67V392.28l9.09-9.09,10.81-10.8L50,362.72l4.55-4.55V43.78Zm4-4,9.66,9.67,5.69,5.12L58.56,39.8H214.9l18.77-19.33,5.68-5.12L249,5.68ZM70.5,362.15H58.56l-4,4-8.53,8.53-1.71,1.71-.56.56L33,387.74l-8.52,8.52H36.39Zm19.9,0H78.46L44.34,396.26H56.28Zm-.57-197.28,4.55-4.55V83l-6.83-6.82-4-4L77.32,66l-4-4-5.68-5.69-4-4-3.41-3.41V194.44l9.1-9.1,10.23-10.8h.57Zm0,158.05,4.55-4.54V241.62l-6.83-7.39-4-4-6.25-5.68-4-4-5.68-6.26-4-3.41-3.41-3.41v145l9.1-9.1ZM70.5,44.91H64.24l3.42,3.41ZM98.36,164.3v.56l-4,3.36-8.53,8.39-1.71,2.23h-.57L72.2,190.58l-8,7.27H214.9l18.77-18.45,5.68-5.59L249,164.3ZM70.5,203.53H64.24l3.42,3.41ZM98.36,322.35l-4.55,4.55-7.39,8-2.28,1.71-.57.57-10.8,10.8-8.53,8.53H214.9l18.77-18.76,5.68-5.69,9.67-9.67Zm11.93,39.8H98.36L64.24,396.26H76.18ZM90.4,44.91H78.46L71.63,52.3l2.28,2.28,3.41,4Zm0,158.62H78.46l-6.83,7.39,2.28,2.28,3.41,3.41ZM110.29,44.91H98.36L81.3,62l6.25,6.25Zm0,158.62H98.36L81.3,220.59l6.25,6.25Zm19.9,158.62H118.25L84.14,396.26H96.08Zm0-317.24H118.25L91,72.2l6.26,5.69Zm0,158.62H118.25L91,230.25l6.26,6.26Zm19.9-158.62H138.15L104,79.59H116Zm0,158.62H138.15L104,237.64H116Zm0,158.62H138.15L104,396.26H116ZM170,44.91H158.05L123.94,79.59h11.94Zm0,158.62H158.05l-34.11,34.11h11.94Zm0,158.62H158.05l-34.11,34.11h11.94ZM189.32,44.91H177.38L143.27,79.59h11.94Zm0,158.62H177.38l-34.11,34.11h11.94Zm0,158.62H177.38l-34.11,34.11h11.94Zm19.9-317.24H197.28L163.17,79.59h11.94Zm0,158.62H197.28l-34.11,34.11h11.94ZM197.28,362.15l-34.11,34.11h11.94l34.11-34.11ZM183.07,79.59H195l27.29-26.72L216,46.62Zm0,158H195l27.29-26.72L216,204.67Zm33,125.65-33,33H195L222.29,369ZM203,79.59H214.9L232,62.54l-6.25-5.69Zm29,141-6.25-6.26L203,237.64H214.9Zm0,158.62L225.71,373,203,396.26H214.9ZM253,60.83V9.67l-5.12,5.11-4.55,4.55h-.57l-.57.57-4.55,4.55L220,42.64l17.62,17.62L243.33,66,253,75.61V60.83Zm0,158.62V167.71l-5.12,5.12-4.55,4.55-.57.57-.57.57-4.55,4.55L220,200.69l17.62,18.19,5.69,5.12,9.67,9.66V219.45Zm0,158.62V326.33l-5.12,5.12L243.33,336l-.57.57h-.57l-4.55,5.11L220,359.31l17.62,17.62,5.69,5.69,9.67,9.66V378.07ZM222.86,79.59H234.8l6.82-6.82-5.68-6.25Zm0,158H234.8l6.82-7.39-5.68-5.68Zm0,158.62H234.8l6.82-7.39-5.68-5.68Zm19.9-316.67H249l-2.85-2.27-.57-.57Zm0,158H249l-2.85-2.84-.57-.57Zm0,158.62H249l-2.85-2.84-.57-.57Z");
    			add_location(path0, file$2, 0, 143, 143);
    			attr_dev(path1, "d", "M542.94,0c1.51,0,2.27,1,2.27,2.84v158a3.3,3.3,0,0,1-.57,2.28l-19.89,19.9-17.63,17.62,37.52,37.52a3.3,3.3,0,0,1,.57,2.28V400.24l-.57.57-19.78,14.78v.57h-.57v.57H448.54a2.5,2.5,0,0,1-2.82-2.84V262.66H387.16V398.54a2.32,2.32,0,0,1-.28,1.42,1.13,1.13,0,0,0-.29.85l-19.9,14.78a3.22,3.22,0,0,1-2.27,1.14H289.94a2.5,2.5,0,0,1-2.84-2.84V16.49a3.26,3.26,0,0,1,1.14-2.28L301.88,2.27a1.14,1.14,0,0,1,.29-.85,1.19,1.19,0,0,0,.28-.85,2.44,2.44,0,0,0,1.14-.29A2.58,2.58,0,0,1,304.72,0H542.94ZM307.57,10.23V391.71l34.11-33.54V43.78Zm4-4.55L326.33,19.9l5.12,5.68L345.66,39.8H501.44L535.55,5.68Zm.57,390.58h11.37l26.72-26.72-5.69-5.68-15.35,15.35-4,4Zm18.76,0h11.94l17.05-17.05-5.68-5.69Zm23.31-340-4-4-2.85-2.84V193.3l33.55-33.54V83l-6.83-6.82-4-4L363.85,66l-4-4Zm26.72,309.28V241.62l-6.83-7.39-4-4-6.26-5.68-4-4-5.68-6.26-4-4-2.85-2.27V358.17l14.22,14.22,5.68,5.11,13.65,14.21V365.56Zm-30.13,30.7h11.93l7.4-6.82-6.26-6.25ZM357.6,44.91h-6.26l2.85,3.41Zm99.56,152.94h38.69l-34.14-34.11H385.48L371.26,178l-5.69,5.68-14.23,14.22Zm-99.56,5.68h-6.26l2.85,2.85ZM376.93,44.91H365l-6.82,6.83L364.42,58Zm0,158.62H365l-6.82,6.82,6.25,6.26Zm19.9-158.62H384.89L368.4,62l2.84,2.84,2.84,2.84ZM374.08,226.27l22.75-22.74H384.89L368.4,220l2.84,3.41Zm-3.41,170h6.26l-2.85-2.84ZM416.72,44.91H404.79L378.07,71.63l6.25,6.26Zm0,158.62H404.79l-26.72,26.72,6.25,5.69Zm28.43-98.92h-58v54h58Zm-8.53-59.7H424.68L390.57,79h11.94ZM390.57,237.64h11.94l34.11-34.11H424.68ZM456.52,44.91H444.58L410.47,79h11.94ZM444.58,203.53l-34.11,34.11h11.94l34.11-34.11ZM476.7,44.91H464.12L429.8,79h12.58ZM429.8,237.64h12.58l34.32-34.11H464.12ZM495.85,44.91h-12L449.7,79h12ZM449.7,237.64h12l34.18-34.11h-12Zm50-188.18L495.18,54l-9.1,9.1-.56,1.13-5.12,4.55L466.19,83v76.76l14.24,14.78,5.69,5.11,9.12,9.1,4.55,4.55ZM466.19,391.71l33.54-33.54V208.08l-12.51,12.51-1.14,1.14-.56.56L483.81,224l-.57.57-2.84,2.84-14.21,14.21Zm4.31,4.55h11.38l27.28-26.72-5.68-5.68L490.4,376.37l-2.84,2.84-.57.57-3.41,3.41-4,4Zm19.15,0h11.94l17.05-17.05-6.25-5.69Zm49.88-386L525.88,23.88l-1.13.57L520.2,29l-5.12,5.69-9.1,9.1V193.3l33.55-33.54Zm0,355.33V241.62L506,208.08V358.17l14.22,14.22,5.68,5.11,13.65,14.21V365.56Zm-30.14,30.7h11.94l6.83-6.82-5.69-6.25Zm19.9,0h6.26l-3.41-2.84Z");
    			add_location(path1, file$2, 0, 2855, 2855);
    			attr_dev(path2, "d", "M829.48,0c1.51,0,2.27,1,2.27,2.84v158a3.35,3.35,0,0,1-.57,2.28l-19.9,19.9-17.62,17.62,37.52,37.52a3.35,3.35,0,0,1,.57,2.28V400.24l-.57.57L811.4,415.59v.57h-.57v.57H735.08a2.5,2.5,0,0,1-2.82-2.84V262.66H673.7V398.54a2.23,2.23,0,0,1-.29,1.42,1.16,1.16,0,0,0-.28.85l-19.9,14.78a3.24,3.24,0,0,1-2.27,1.14H576.48a2.5,2.5,0,0,1-2.84-2.84V16.49a3.29,3.29,0,0,1,1.13-2.28L588.42,2.27a1.18,1.18,0,0,1,.28-.85A1.15,1.15,0,0,0,589,.57a2.47,2.47,0,0,0,1.14-.29A2.58,2.58,0,0,1,591.26,0H829.48ZM594.1,10.23V391.71l34.12-33.54V43.78Zm4-4.55L612.87,19.9,618,25.58,632.2,39.8H788L822.08,5.68Zm.57,390.58H610l26.72-26.72-5.68-5.68-15.35,15.35-4,4Zm18.76,0h11.94l17.06-17.05-5.69-5.69Zm23.31-340-4-4-2.84-2.84V193.3l33.54-33.54V83l-6.82-6.82-4-4L650.39,66l-4-4Zm26.72,309.28V241.62l-6.82-7.39-4-4-6.25-5.68-4-4-5.69-6.26-4-4-2.84-2.27V358.17l14.22,14.22,5.68,5.11,13.64,14.21V365.56Zm-30.13,30.7h11.94l7.39-6.82-6.25-6.25Zm6.82-351.35h-6.25l2.84,3.41ZM743.7,197.85h38.68l-34.13-34.11H672L657.8,178l-5.7,5.68-14.22,14.22Zm-99.57,5.68h-6.25l2.84,2.85ZM663.46,44.91H651.53l-6.83,6.83L651,58Zm0,158.62H651.53l-6.83,6.82,6.26,6.26Zm19.9-158.62H671.42L654.94,62l2.84,2.84,2.84,2.84ZM660.62,226.27l22.74-22.74H671.42L654.94,220l2.84,3.41Zm-3.41,170h6.25l-2.84-2.84Zm46-351.35H691.32L664.6,71.63l6.26,6.26Zm0,158.62H691.32L664.6,230.25l6.26,5.69Zm28.43-98.92h-58v54h58Zm-8.53-59.7H711.22L677.11,79h11.94Zm-46,192.73h11.94l34.11-34.11H711.22ZM743.06,44.91H731.12L697,79H709ZM731.12,203.53,697,237.64H709l34.11-34.11ZM763.23,44.91H750.65L716.34,79h12.58ZM716.34,237.64h12.58l34.31-34.11H750.65Zm66-192.73h-12L736.24,79h12ZM736.24,237.64h12l34.18-34.11h-12Zm50-188.18L781.72,54l-9.1,9.1-.57,1.13-5.11,4.55L752.72,83v76.76L767,174.54l5.7,5.11,9.11,9.1,4.56,4.55ZM752.72,391.71l33.55-33.54V208.08l-12.51,12.51-1.14,1.14-.57.56-1.7,1.71-.57.57-2.84,2.84-14.22,14.21Zm4.32,4.55h11.37l27.29-26.72L790,363.86l-13.08,12.51-2.84,2.84-.57.57-3.41,3.41-4,4Zm19.14,0h11.94l17.06-17.05-6.25-5.69Zm49.88-386L812.42,23.88l-1.14.57L806.73,29l-5.11,5.69-9.1,9.1V193.3l33.54-33.54Zm0,355.33V241.62l-33.54-33.54V358.17l14.21,14.22,5.69,5.11,13.64,14.21V365.56Zm-30.13,30.7h11.94l6.82-6.82L809,383.19Zm19.9,0h6.25l-3.41-2.84Z");
    			add_location(path2, file$2, 0, 5062, 5062);
    			attr_dev(path3, "d", "M1118.29,2.84V399.11a2.32,2.32,0,0,1-.57,1.7l-15.35,15.35h-.57v.57H861.88l-.57-.57h-.57v-.57l-.57-.57v-398a.5.5,0,0,1,.57-.57v-.57L876.09.57h.57A1.66,1.66,0,0,1,877.8,0h239.35V.57h.57a.5.5,0,0,0,.57.57v1.7ZM880.64,9.1V392.28l8.53-8.52,21.6-21,4-4.55v-315Zm4-3.42,9.67,9.67L900,20.47,918.73,39.8h156.35l18.76-19.33,4.55-4.55,1.13-.57,9.67-9.67Zm0,390.58h11.94l34.11-34.11H918.73l-4,4L892,388.3Zm19.9,0h11.94l34.11-34.11H938.63ZM920.44,63.11V352.49L929,344l10.8-10.8.57-.57,9.66-9.67,4.55-4.54V83l-7.39-6.82-3.41-4L937.49,66l-4-4-5.68-5.69-4-4-3.41-3.41V63.11Zm10.23-18.2h-6.25l3.41,3.41Zm93.24,277.44H958.53l-3.41,3.42-9.1,9.09-1.7,1.71-.57.57-12.51,12.5-6.82,6.83h145l-2.84-2.85-18.76-18.76-12.51-12.51Zm-99.49,73.91h11.94l34.11-34.11H958.53ZM950.57,44.91H938.63l-7.39,7.39,2.84,2.28L937.49,58Zm19.9,0H958.53L941.47,62l5.69,6.25ZM944.32,396.26h11.93l34.12-34.11H978.43Zm46-351.35H978.43L951.14,72.2l6.25,5.69Zm28.42,55.15H960.23V316.67h58.56Zm-8.52-55.15H997.76L963.65,79.59h12.5ZM963.65,396.26h12.5l34.12-34.11H997.76Zm65.94-351.35h-11.93L983.54,79.59h11.94Zm-46,351.35h11.94l34.11-34.11h-11.93Zm66-351.35h-11.94l-34.11,34.68h11.94Zm-46,351.35h11.94l34.11-34.11h-11.94Zm66-351.35h-11.94l-34.11,34.68h11.94l19.33-19.07,5.12-5.78Zm-46.05,351.35h11.94l34.11-34.11h-11.94Zm50-347.37L1068.82,54l-5.11,4.55L1058,64.24l-9.1,9.1L1039.26,83V318.38L1058,337.71l5.69,5.11,9.66,9.67Zm-30.13,347.37h11.94L1081.9,369l-5.69-5.68ZM1087,374.09l-1.14-1.14-22.74,23.31h11.94l17.05-17.05Zm26.15,4V9.1l-5.12,5.11-4.55,4.55-1.13,1.14-4.55,4.55-9.67,9.66-9.09,9.1v315l18.76,18.76,5.68,5.69,9.67,9.66V378.07Zm-11.37,10.8-5.69-5.68L1083,396.26H1095Zm.57,7.39h6.82l-3.41-3.41Z");
    			add_location(path3, file$2, 0, 7251, 7251);
    			attr_dev(path4, "d", "M1402.55,0c1.51,0,2.27,1,2.27,2.84v158a3.3,3.3,0,0,1-.57,2.28l-19.89,19.9-17.63,17.62,37.52,37.52a3.3,3.3,0,0,1,.57,2.28V400.24l-.57.57-19.78,14.78v.57h-.57v.57h-75.74a2.5,2.5,0,0,1-2.83-2.84V262.66h-58.56V398.54a2.32,2.32,0,0,1-.28,1.42,1.13,1.13,0,0,0-.29.85l-19.9,14.78a3.22,3.22,0,0,1-2.27,1.14h-74.48a2.5,2.5,0,0,1-2.84-2.84V16.49a3.26,3.26,0,0,1,1.14-2.28l13.64-11.94a1.14,1.14,0,0,1,.29-.85,1.19,1.19,0,0,0,.28-.85,2.44,2.44,0,0,0,1.14-.29,2.58,2.58,0,0,1,1.13-.28h238.22ZM1167.18,10.23V391.71l34.11-33.54V43.78Zm4-4.55,14.78,14.22,5.12,5.68,14.21,14.22h155.78l34.11-34.12Zm.57,390.58h11.37l26.72-26.72-5.69-5.68-15.35,15.35-4,4Zm18.76,0h11.94l17-17.05-5.68-5.69Zm23.31-340-4-4L1207,49.46V193.3l33.55-33.54V83l-6.82-6.82-4-4L1223.46,66l-4-4Zm26.72,309.28V241.62l-6.82-7.39-4-4-6.26-5.68-4-4-5.68-6.26-4-4-2.85-2.27V358.17l14.22,14.22,5.68,5.11,13.65,14.21V365.56Zm-30.13,30.7h11.94l7.39-6.82-6.26-6.25Zm6.82-351.35H1211l2.85,3.41Zm99.56,152.94h38.69l-34.14-34.11h-76.23L1230.87,178l-5.69,5.68L1211,197.85Zm-99.56,5.68H1211l2.85,2.85Zm19.33-158.62H1224.6l-6.82,6.83L1224,58Zm0,158.62H1224.6l-6.82,6.82,6.25,6.26Zm19.9-158.62H1244.5L1228,62l2.84,2.84,2.85,2.84ZM1233.7,226.27l22.74-22.74H1244.5L1228,220l2.84,3.41Zm-3.42,170h6.26l-2.84-2.84Zm46-351.35H1264.4l-26.72,26.72,6.25,6.26Zm0,158.62H1264.4l-26.72,26.72,6.25,5.69Zm28.43-98.92h-58v54h58Zm-8.53-59.7h-11.94L1250.18,79h11.94Zm-46,192.73h11.94l34.11-34.11h-11.94Zm66-192.73h-11.94L1270.08,79H1282Zm-11.94,158.62-34.11,34.11H1282l34.11-34.11Zm32.12-158.62h-12.58L1289.41,79H1302Zm-46.9,192.73H1302l34.32-34.11h-12.58Zm66-192.73h-12L1309.31,79h12Zm-46.15,192.73h12l34.18-34.11h-12Zm50-188.18L1354.79,54l-9.09,9.1-.57,1.13L1340,68.79,1325.8,83v76.76L1340,174.54l5.69,5.11,9.12,9.1,4.55,4.55ZM1325.8,391.71l33.54-33.54V208.08l-12.51,12.51-1.13,1.14-.57.56-1.71,1.71-.57.57-2.84,2.84-14.21,14.21Zm4.31,4.55h11.38l27.28-26.72-5.68-5.68L1350,376.37l-2.84,2.84-.57.57-3.41,3.41-4,4Zm19.15,0h11.94l17-17.05-6.25-5.69Zm49.88-386-13.65,13.65-1.13.57L1379.81,29l-5.12,5.69-9.1,9.1V193.3l33.55-33.54Zm0,355.33V241.62l-33.55-33.54V358.17l14.22,14.22,5.68,5.11,13.65,14.21V365.56ZM1369,396.26h11.94l6.83-6.82-5.69-6.25Zm19.9,0h6.26l-3.41-2.84Z");
    			add_location(path4, file$2, 0, 8914, 8914);
    			attr_dev(g0, "id", "Layer_1-2");
    			attr_dev(g0, "data-name", "Layer 1");
    			add_location(g0, file$2, 0, 105, 105);
    			attr_dev(g1, "id", "Layer_2");
    			attr_dev(g1, "data-name", "Layer 2");
    			add_location(g1, file$2, 0, 69, 69);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 1404.82 416.73");
    			add_location(svg, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g1);
    			append_dev(g1, g0);
    			append_dev(g0, path0);
    			append_dev(g0, path1);
    			append_dev(g0, path2);
    			append_dev(g0, path3);
    			append_dev(g0, path4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Error", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Error> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Error$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Error",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    const contentHabitDetailCategoryData = [
    	{
    		title: "Physical Habit",
    		label: "physical",
    		content:
    			"Walking, running, exercise, improved posture, quit smoking, stop biting nails.",
    	},
    	{
    		title: "Learning Habit",
    		label: "learning",
    		content:
    			"Taking a new course, reading, learning a new skill, unlearn limiting beliefs.",
    	},
    	{
    		title: "Social Habit",
    		label: "social",
    		content:
    			"Calling friends or family, meeting new people, being more open, stop toxic patterns.",
    	},
    ];

    const contentHabitDurationData = [
    	// { disabled: false, value: 60, text: `1 min` },
    	// { disabled: false, value: 300, text: `5 min` },
    	// { disabled: false, value: 3600, text: `1 hour` },
    	{ disabled: false, value: 3600 * 24, text: `24 hours` },
    	{ disabled: false, value: 3600 * 24 * 3, text: `3 days` },
    	{ disabled: true, value: 3600 * 24 * 7, text: `7 days` },
    	{ disabled: true, value: 3600 * 24 * 21, text: `21 days` },
    	{ disabled: true, value: 3600 * 24 * 100, text: `100 days` },
    	{ disabled: true, value: 3600 * 24 * 365, text: `1 year` },
    ];

    const isLocalStorageFun = () => {
    	if (typeof localStorage !== "undefined") {
    		try {
    			localStorage.setItem("feature_test", "yes");
    			if (localStorage.getItem("feature_test") === "yes") {
    				localStorage.removeItem("feature_test");
    				// localStorage is enabled
    				return true;
    			} else {
    				// localStorage is disabled
    				return false;
    			}
    		} catch (e) {
    			// localStorage is disabled
    			return false;
    		}
    	} else {
    		// localStorage is not available
    		return false;
    	}
    };

    const isObjectEmptyFun = (obj) => {
    	for (let i in obj) return false;
    	return true;
    };

    const getUserProfileBlankFun = () => {
    	return {
    		adminDateCreated: null,
    		adminOther: {},
    		adminIdPod: null,
    		adminIdUser: null,
    		adminScoreUser: 0,
    		detailEmail: "",
    		detailImage: "",
    		detailInitials: "",
    		detailIsAccountPrivate: null,
    		detailName: "",
    		detailPassword: "",
    		detailSocialAccounts: {},
    		detailTitle: "",
    		habitIdsActive: [],
    		habitIdsHistory: [],
    	};
    };

    const getUserHabitBlankFun = () => {
    	return {
    		adminActivePosition: null,
    		adminDateEndUTCString: "",
    		adminDateStartUTCString: "",
    		adminIdHabit: null,
    		adminIdSeries: null,
    		adminIdUser: null,
    		adminIsActive: null,
    		adminScore: 0,
    		detailCategory: {
    			isCategory1: false,
    			isCategory2: false,
    			isCategory3: false,
    		},
    		detailCode: "",
    		detailDescription: "",
    		detailDuration: 0,
    		detailIsNewHabit: "",
    		detailTitle: "",
    		checks: [],
    		messages: [],
    		reflectComment: "",
    		reflectDifficulty: null,
    		reflectIsSuccessful: null,
    		reflectRating: 0,
    		reflectRecommend: null,
    	};
    };

    const userAuthData = {
    	prop1: null,
    	prop2: null,
    	prop3: null,
    };

    const userProfileData = getUserProfileBlankFun();
    const userHabitsActiveData = [null, null, null];
    const userHabitsHistoryData = [];

    const contentHabitDetailCategory = readable(
    	contentHabitDetailCategoryData
    );
    const contentHabitDuration = readable(contentHabitDurationData);

    const userId = writable(null);
    const userAuth = writable(userAuthData);
    const userProfile = writable(userProfileData);
    const userHabitsActive = writable(userHabitsActiveData);
    const userHabitsHistory = writable(userHabitsHistoryData);

    const indexActiveHabit = writable(0);

    const isNewSocialModal = writable(false);
    const isLSDataOutdated = writable(false);
    const isDataOutdatedHistory = writable(false);
    const isLocalStorage = writable(null);
    const isObjectEmpty = readable(isObjectEmptyFun);

    const getUserProfileBlank = readable(getUserProfileBlankFun);
    const getUserHabitBlank = readable(getUserHabitBlankFun);
    const getIsLocalStorage = readable(isLocalStorageFun);

    const errMessage = writable(null);
    const API_ENDPOINT = readable(
    	"https://sanderjson-pr-2021-days.builtwithdark.com"
    );

    /* src/routes/ScreenError.svelte generated by Svelte v3.32.1 */

    const { Error: Error_1$2 } = globals;
    const file$3 = "src/routes/ScreenError.svelte";

    // (8:0) <AppHeader>
    function create_default_slot_1(ctx) {
    	let error;
    	let current;
    	error = new Error$1({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(error.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(error, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(error.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(error.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(error, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(8:0) <AppHeader>",
    		ctx
    	});

    	return block;
    }

    // (12:0) <ContentWrapper>
    function create_default_slot(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let a;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Error: ");
    			t1 = text(/*$errMessage*/ ctx[0]);
    			t2 = space();
    			a = element("a");
    			a.textContent = "Click here";
    			add_location(div, file$3, 12, 2, 291);
    			attr_dev(a, "href", "/#/start");
    			add_location(a, file$3, 13, 2, 325);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, a, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$errMessage*/ 1) set_data_dev(t1, /*$errMessage*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(12:0) <ContentWrapper>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let appheader;
    	let t;
    	let contentwrapper;
    	let current;

    	appheader = new AppHeader({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	contentwrapper = new ContentWrapper({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(appheader.$$.fragment);
    			t = space();
    			create_component(contentwrapper.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$2("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(appheader, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(contentwrapper, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const appheader_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				appheader_changes.$$scope = { dirty, ctx };
    			}

    			appheader.$set(appheader_changes);
    			const contentwrapper_changes = {};

    			if (dirty & /*$$scope, $errMessage*/ 3) {
    				contentwrapper_changes.$$scope = { dirty, ctx };
    			}

    			contentwrapper.$set(contentwrapper_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(appheader.$$.fragment, local);
    			transition_in(contentwrapper.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(appheader.$$.fragment, local);
    			transition_out(contentwrapper.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(appheader, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(contentwrapper, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $errMessage;
    	validate_store(errMessage, "errMessage");
    	component_subscribe($$self, errMessage, $$value => $$invalidate(0, $errMessage = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ScreenError", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ScreenError> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		ContentWrapper,
    		AppHeader,
    		Error: Error$1,
    		errMessage,
    		$errMessage
    	});

    	return [$errMessage];
    }

    class ScreenError extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScreenError",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/svg/2021.svelte generated by Svelte v3.32.1 */

    const file$4 = "src/svg/2021.svelte";

    function create_fragment$5(ctx) {
    	let svg;
    	let g1;
    	let g0;
    	let path0;
    	let path1;
    	let path2;
    	let path3;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			attr_dev(path0, "d", "M258.11,2.84V241.05q0,.58-1.14,1.71L242.76,257v.57h-.57v.57H100.06v58.56h58.56V293.93l.57-.57L174.54,278a.51.51,0,0,0,.57-.57H257a.5.5,0,0,0,.57.57.5.5,0,0,0,.57.57v121.1a1.6,1.6,0,0,1-.57,1.13l-15.35,15.35h-.57v.57H1.71v-.57H.57v-.57A.51.51,0,0,0,0,415V175.11H.57v-.57l15.35-15.35h.57v-.57H158.62V100.06H100.06v21.6a1.2,1.2,0,0,1-.28.86,1.13,1.13,0,0,0-.29.85h-.57L84.14,138.72h-.57v.57H1.71a.5.5,0,0,1-.57-.57H.57v-.57L0,137.58V17.05l.57-.56v-.57L15.92.57h.57A2.32,2.32,0,0,1,18.19,0H257V.57h.57v.57h.57v1.7Zm-203.53,58V43.21L20.47,9.1V114.84l9.09-8.53,21-21,4-4.55V60.83ZM20.47,167.71V392.29l9.09-8.53L39.8,373l.57-.56,10.23-9.67,4-4.55V201.83Zm4-162,9.66,9.67H239.35L249,5.68ZM39.8,103.47l-1.14,1.14L24.45,118.82H36.39L63.67,92.1l-6.25-6.25L50,93.24l-.57.57-.57,1.13h-.57l-1.13,1.14ZM24.45,163.73l9.66,9.67,5.69,5.69,18.76,18.76H209.22L206.38,195l-19.9-19.89-11.37-11.38H24.45ZM70.5,362.15H58.56l-4,4-21,21-9.09,9.09H36.39ZM214.9,39.8l18.77-19.33H39.8L58.56,39.8Zm-141.56,62-5.69-6.26L44.34,118.82H56.28ZM90.4,362.15H78.46L44.34,396.26H56.28Zm4-253.56V83l-1.14-1.13L87,76.18l-3.41-4L77.32,66l-4-4-5.69-5.68-4-4-3.41-3.41V80.73L79,99.49l5.68,5.69,9.67,9.66ZM68.79,344l21-21,4.55-4.54V241.63l-7.4-7.4-3.41-4-6.25-5.68-4-4-5.69-6.25-4-3.42-3.41-3.41v145Zm1.71-299H64.24l3.41,3.41Zm-6.26,73.91H76.18l7.39-7.39-6.25-5.68Zm6.26,84.71H64.24l3.41,3.41ZM98.36,322.36l-4,4L84.14,336.57l-.57.57L71.63,349.07l-7.39,7.4h145l-2.84-2.84-19.9-19.9-11.37-11.37H98.36Zm11.93,39.79H98.36L64.24,396.26H76.18ZM90.4,44.91H78.46L71.63,52.3l2.28,2.28L77.32,58Zm0,158.62H78.46l-6.83,7.39,2.28,2.28,3.41,3.41Zm8-158.62L81.3,62l6.25,6.25,22.74-23.31Zm11.93,158.62H98.36L81.3,220.59l6.25,6.25ZM84.14,118.82H90.4L87.55,116l-.57-.57Zm46.05,243.33H118.25L84.14,396.26H96.08Zm0-317.24H118.25L91,72.2l6.26,5.69Zm0,158.62H118.25L91,230.25l6.26,6.26ZM104,79.59H116l34.11-34.68H138.15Zm0,158H116l34.11-34.11H138.15Zm46.05,124.51H138.15L104,396.26H116Zm7.39-317.24L123.37,79.59h12.51L170,44.91ZM170,203.53H157.48l-34.11,34.11h12.51Zm0,158.62H157.48l-34.11,34.11h12.51ZM155.21,79.59l34.11-34.68H177.38L143.27,79Zm34.11,123.94H177.38l-34.11,34.11h11.94Zm0,158.62H177.38l-34.11,34.11h11.94ZM175.11,79.59l19.33-19.07,2.27-2.89L199,55.89l.57-1.15,9.67-9.83H197.28L163.17,79Zm34.11,123.94H197.28l-34.11,34.11h11.94Zm0,158.62H197.28l-34.11,34.11h11.94ZM179.09,159.76l18.76,19.33,5.68,5.11,9.67,9.67v-145L208.65,54l-5.12,4.55-.57.57-2.27,2.27-2.84,2.84-9.1,9.1L179.09,83Zm0,126.78v31.84l18.76,19.33,5.68,5.11,9.67,9.67V320.65l-.57-.57-.57-.57-5.12-5.12Zm4-48.9H195l27.29-26.72L216,204.67Zm0,44.92,9.66,9.66,5.69,5.69L216,315.53l17.63-17.62,5.68-5.69,9.66-9.66Zm0,113.7H195L222.29,369,216,363.29Zm43.2-181.36-.56-.56L203,237.64H214.9l17.06-17Zm0,158.62-.56-.57L203,396.26H214.9L232,379.21ZM253,219.45V9.1l-5.12,5.11-4.55,4.55-1.14,1.14-4.55,4.55L228,34.11l-9.1,9.1V199.55l18.76,18.76,5.69,5.69,9.67,9.66V219.45Zm0,158.62V286.54l-5.12,5.11-4.55,4.55-.57.57-.57.57-4.55,4.55L228,311.55l-9.1,9.1v37.52l18.76,18.76,5.69,5.69,9.67,9.67V378.07ZM241.62,230.25l-5.68-5.68-13.08,13.07H234.8Zm0,158.62-5.68-5.68-13.08,13.07H234.8Zm1.71-151.23H249l-2.84-2.84-.57-.57-3.41,3.41Zm0,158.62H249l-2.84-2.84-.57-.57-3.41,3.41Z");
    			add_location(path0, file$4, 3, 6, 157);
    			attr_dev(path1, "d", "M544.64,2.84V399.11a2.32,2.32,0,0,1-.56,1.7l-15.36,15.35h-.56v.57H288.24l-.57-.57h-.57v-.57l-.57-.57v-398a.5.5,0,0,1,.57-.56v-.57L302.45.57H303A1.65,1.65,0,0,1,304.16,0H543.51V.57h.57a.5.5,0,0,0,.56.57v1.7ZM307,9.1V392.29l8.53-8.53,21.6-21,4-4.55v-315Zm4-3.42,9.66,9.67,5.69,5.12L345.09,39.8H501.44L520.2,20.47l4.55-4.55,1.13-.57,9.67-9.67Zm0,390.58h11.94L357,362.15H345.09l-4,4L318.37,388.3Zm19.9,0h11.94l34.11-34.11H365ZM346.8,63.11V352.49l8.52-8.53,10.81-10.8.56-.57,9.67-9.67,4.55-4.54V83l-7.39-6.82-3.41-4L363.85,66l-4-4-5.68-5.68-4-4-3.41-3.41V63.11ZM357,44.91h-6.25l3.41,3.41Zm93.24,277.45H384.89l-3.41,3.41-9.1,9.09-1.71,1.71-.56.57-12.51,12.5-6.82,6.83h145l-2.84-2.84-18.76-18.77-12.51-12.5Zm-99.49,73.9h11.93l34.12-34.11H384.89ZM376.93,44.91H365L357.6,52.3l2.84,2.28L363.85,58Zm19.9,0H384.89L367.83,62l5.69,6.25ZM370.67,396.26h11.94l34.11-34.11H404.79ZM416.72,44.91H404.79L377.5,72.2l6.25,5.69Zm28.43,55.15H386.59V316.67h58.56Zm-8.53-55.15h-12.5L390,79.59h12.51ZM390,396.26h12.51l34.11-34.11h-12.5ZM456,44.91H444L409.9,79.59h11.94ZM409.9,396.26h11.94L456,362.15H444Zm66-351.35H463.91L429.8,79.59h11.94ZM429.8,396.26h11.94l34.11-34.11H463.91ZM495.75,44.91H483.81L449.7,79.59h11.94L481,60.52l5.11-5.78ZM449.7,396.26h11.94l34.11-34.11H483.81Zm50-347.37L495.18,54l-5.11,4.55-5.69,5.68-9.1,9.1L465.62,83V318.38l18.76,19.33,5.69,5.11,9.66,9.67ZM469.6,396.26h11.94L508.26,369l-5.69-5.68Zm43.78-22.17L512.24,373,489.5,396.26h11.94l17.05-17.05Zm26.15,4V9.1l-5.12,5.11-4.55,4.55-1.14,1.14-4.54,4.55-9.67,9.66-9.09,9.1v315l18.76,18.76,5.68,5.69,9.67,9.67V378.07Zm-11.37,10.8-5.69-5.68L509.4,396.26h11.93Zm.56,7.39h6.83l-3.41-3.41Z");
    			add_location(path1, file$4, 5, 6, 3352);
    			attr_dev(path2, "d", "M830.61,2.84V241.05c0,.39-.38,1-1.13,1.71L815.26,257v.57h-.57v.57H672.56v58.56h58.56V293.93l.57-.57L747,278a.51.51,0,0,0,.57-.57h81.87a.5.5,0,0,0,.56.57.5.5,0,0,0,.57.57v121.1a1.6,1.6,0,0,1-.57,1.13l-15.35,15.35h-.56v.57H574.21v-.57h-1.14v-.57a.51.51,0,0,0-.57-.57V175.11h.57v-.57l15.35-15.35H589v-.57H731.12V100.06H672.56v21.6a1.2,1.2,0,0,1-.28.86,1.13,1.13,0,0,0-.29.85h-.57l-14.78,15.35h-.57v.57H574.21a.5.5,0,0,1-.57-.57h-.57v-.57l-.57-.57V17.05l.57-.56v-.57L588.42.57H589a2.32,2.32,0,0,1,1.7-.57H829.48V.57H830v.57h.57v1.7Zm-203.53,58V43.21L593,9.1V114.84l9.09-8.53,21-21,4-4.55V60.83ZM593,167.71V392.29l9.09-8.53L612.3,373l.57-.56,10.23-9.67,4-4.55V201.83Zm4-162,9.66,9.67H811.85l9.67-9.67Zm15.35,97.79-1.14,1.14L597,118.82h11.94L636.18,92.1l-6.26-6.25-7.39,7.39-.57.57-.57,1.13h-.56l-1.14,1.14ZM597,163.73l9.66,9.67,5.69,5.69,18.76,18.76H781.72L778.88,195,759,175.11l-11.37-11.38H597Zm46,198.42H631.06l-4,4-21,21L597,396.26h11.94ZM787.4,39.8l18.77-19.33H612.3L631.06,39.8Zm-141.56,62-5.68-6.26-23.31,23.31h11.94ZM662.9,362.15H651l-34.11,34.11h11.94Zm4-253.56V83l-1.14-1.13-6.25-5.69-3.42-4L649.82,66l-4-4-5.68-5.68-4-4-3.42-3.41V80.73l18.77,18.76,5.68,5.69,9.67,9.66ZM641.29,344l21-21,4.55-4.54V241.63l-7.39-7.4-3.42-4-6.25-5.68-4-4-5.68-6.25-4-3.42-3.42-3.41v145Zm1.71-299h-6.26l3.42,3.41Zm-6.26,73.91h11.94l7.39-7.39-6.25-5.68ZM643,203.53h-6.26l3.42,3.41Zm27.86,118.83-4,4-10.24,10.23-.57.57-11.93,11.93-7.4,7.4h145l-2.84-2.84L759,333.73l-11.37-11.37H670.86Zm11.93,39.79H670.86l-34.12,34.11h11.94ZM662.9,44.91H651l-6.82,7.39,2.27,2.28L649.82,58Zm0,158.62H651l-6.82,7.39,2.27,2.28,3.41,3.41Zm8-158.62L653.8,62l6.25,6.25,22.74-23.31Zm11.93,158.62H670.86L653.8,220.59l6.25,6.25Zm-26.15-84.71h6.26L660.05,116l-.56-.57Zm46.05,243.33H690.75l-34.11,34.11h11.94Zm0-317.24H690.75L663.46,72.2l6.26,5.69Zm0,158.62H690.75l-27.29,26.72,6.26,6.26ZM676.54,79.59h11.94l34.11-34.68H710.65Zm0,158h11.94l34.11-34.11H710.65Zm46.05,124.51H710.65l-34.11,34.11h11.94ZM730,44.91,695.87,79.59h12.51l34.11-34.68Zm12.51,158.62H730l-34.11,34.11h12.51Zm0,158.62H730l-34.11,34.11h12.51ZM727.71,79.59l34.11-34.68H749.88L715.77,79Zm34.11,123.94H749.88l-34.11,34.11h11.94Zm0,158.62H749.88l-34.11,34.11h11.94ZM747.61,79.59l19.33-19.07,2.27-2.89,2.28-1.74.56-1.15,9.67-9.83H769.78L735.67,79Zm34.11,123.94H769.78l-34.11,34.11h11.94Zm0,158.62H769.78l-34.11,34.11h11.94ZM751.59,159.76l18.76,19.33L776,184.2l9.67,9.67v-145L781.15,54,776,58.56l-.57.57-2.27,2.27-2.84,2.84-9.1,9.1L751.59,83Zm0,126.78v31.84l18.76,19.33,5.68,5.11,9.67,9.67V320.65l-.57-.57-.57-.57-5.11-5.12Zm4-48.9h11.94l27.28-26.72-6.25-6.25Zm0,44.92,9.66,9.66,5.69,5.69,17.62,17.62,17.63-17.62,5.68-5.69,9.67-9.66Zm0,113.7h11.94L794.79,369l-6.25-5.68Zm43.2-181.36-.56-.56-22.75,23.3H787.4l17.06-17Zm0,158.62-.56-.57-22.75,23.31H787.4l17.06-17.05ZM825.5,219.45V9.1l-5.12,5.11-4.55,4.55-1.14,1.14-4.54,4.55-9.67,9.66-9.1,9.1V199.55l18.77,18.76,5.68,5.69,9.67,9.66V219.45Zm0,158.62V286.54l-5.12,5.11-4.55,4.55-.57.57-.57.57-4.54,4.55-9.67,9.66-9.1,9.1v37.52l18.77,18.76,5.68,5.69,9.67,9.67V378.07ZM814.13,230.25l-5.69-5.68-13.08,13.07H807.3Zm0,158.62-5.69-5.68-13.08,13.07H807.3Zm1.7-151.23h5.69l-2.85-2.84-.57-.57-3.41,3.41Zm0,158.62h5.69l-2.85-2.84-.57-.57-3.41,3.41Z");
    			add_location(path2, file$4, 7, 6, 5009);
    			attr_dev(path3, "d", "M998.32,2.27v398a.51.51,0,0,0-.57.57l-13.07,14.78a3.26,3.26,0,0,1-2.28,1.14H900.54a.5.5,0,0,1-.57-.57h-.57a.51.51,0,0,0-.57-.57V100.06h-37a.5.5,0,0,1-.57-.57h-1.14l-.57-.57v-.56H859V17.05a.5.5,0,0,1,.57-.56v-.57L875,.57h.57A1.66,1.66,0,0,1,876.66,0h120a.51.51,0,0,1,.57.57h.56a.5.5,0,0,0,.57.57V2.27ZM879.5,9.1V75l18.19-17.62,1.71-1.71v-.56l7.39-7.39,5.68-5.69-10.8-10.8Zm4-3.42,9.66,9.67,5.69,5.12L917.59,39.8h37.52l18.77-19.33,4.54-4.55,1.14-.57,9.67-9.67ZM895.42,79l34.11-34.12H917.59l-4,4-8,8.53-2.27,1.71-12.51,12.5L883.48,79Zm19.9,0,18.76-18.77,5.68-5.68,9.67-9.67H937.49L903.38,79ZM929,73.34,919.3,83V392.29l8.53-8.53L938.63,373l.57-.56,9.66-9.67,4.55-4.55V48.89L948.29,54l-4.55,4.55-5.68,5.68Zm-5.68,322.92h11.94L961.94,369l-5.69-5.68-5.12,5.12-7.39,6.82-.56,1.14L942,377.5l-1.14.57Zm19.9,0h11.93l17.06-17.05L965.92,373Zm25-362.15-9.1,9.1v315l18.77,18.76,5.68,5.69,9.67,9.67V9.1l-5.12,5.11-4.55,4.55L982.4,19.9l-4.54,4.55ZM962.5,396.26h26.73l-2.85-2.84-10.23-10.23Z");
    			add_location(path3, file$4, 9, 6, 8239);
    			attr_dev(g0, "id", "Layer_1-2");
    			attr_dev(g0, "data-name", "Layer 1");
    			add_location(g0, file$4, 2, 4, 112);
    			attr_dev(g1, "id", "Layer_2");
    			attr_dev(g1, "data-name", "Layer 2");
    			add_location(g1, file$4, 1, 2, 71);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 998.32 416.73");
    			add_location(svg, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g1);
    			append_dev(g1, g0);
    			append_dev(g0, path0);
    			append_dev(g0, path1);
    			append_dev(g0, path2);
    			append_dev(g0, path3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("_2021", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<_2021> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class _2021 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_2021",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/routes/ScreenAbout.svelte generated by Svelte v3.32.1 */
    const file$5 = "src/routes/ScreenAbout.svelte";

    // (7:0) <AppHeader>
    function create_default_slot_1$1(ctx) {
    	let twentytwentyone;
    	let current;
    	twentytwentyone = new _2021({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(twentytwentyone.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(twentytwentyone, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(twentytwentyone.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(twentytwentyone.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(twentytwentyone, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(7:0) <AppHeader>",
    		ctx
    	});

    	return block;
    }

    // (11:0) <ContentWrapper>
    function create_default_slot$1(ctx) {
    	let h1;
    	let t1;
    	let div;
    	let p0;
    	let t2;
    	let a;
    	let t4;
    	let t5;
    	let p1;
    	let t7;
    	let p2;
    	let t9;
    	let ul;
    	let li0;
    	let t11;
    	let li1;
    	let t13;
    	let li2;
    	let t15;
    	let p3;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "It has been suggested that it takes twenty-one days to make or break a\n    habit.";
    			t1 = space();
    			div = element("div");
    			p0 = element("p");
    			t2 = text("This simple app can help you track progress.\n      ");
    			a = element("a");
    			a.textContent = "Click here";
    			t4 = text("\n      to visit the signup page, and create an account with your details.");
    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "It is so easy to make a New Year's resolution, and yet hard for so many\n      follow through. Was it too ambitious? Not clearly stated? Or perhaps,\n      there was a lack of social support?";
    			t7 = space();
    			p2 = element("p");
    			p2.textContent = "Whether you use this app or not. Try to set yourself a simple goal, and\n      stick to it. A few examples of successful habits may be:";
    			t9 = space();
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "\"I will walk for 30 minutes every day for the next 21 days\"";
    			t11 = space();
    			li1 = element("li");
    			li1.textContent = "\"I will not smoke for the next 21 days\"";
    			t13 = space();
    			li2 = element("li");
    			li2.textContent = "\"I will practice gratitude everyday for the next 21 days";
    			t15 = space();
    			p3 = element("p");
    			p3.textContent = "We don't need anymore empty New Year's resolutions. People who want real\n      change don't wait for a special day. Help yourself by making a real\n      commitment of twenty-one days.";
    			attr_dev(h1, "class", "text-xl text-gray-700 leading-8");
    			add_location(h1, file$5, 11, 2, 265);
    			attr_dev(a, "class", "underline");
    			attr_dev(a, "href", "#/signup");
    			add_location(a, file$5, 19, 6, 555);
    			add_location(p0, file$5, 17, 4, 494);
    			attr_dev(p1, "class", "mt-2");
    			add_location(p1, file$5, 22, 4, 693);
    			attr_dev(p2, "class", "mt-2");
    			add_location(p2, file$5, 28, 4, 920);
    			add_location(li0, file$5, 33, 6, 1115);
    			add_location(li1, file$5, 34, 6, 1190);
    			add_location(li2, file$5, 35, 6, 1245);
    			attr_dev(ul, "class", "mt-2");
    			add_location(ul, file$5, 32, 4, 1091);
    			attr_dev(p3, "class", "mt-2");
    			add_location(p3, file$5, 37, 4, 1325);
    			attr_dev(div, "class", " space-y-6 mt-6 prose prose-indigo prose-lg text-gray-500 mx-auto");
    			add_location(div, file$5, 15, 2, 406);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, t2);
    			append_dev(p0, a);
    			append_dev(p0, t4);
    			append_dev(div, t5);
    			append_dev(div, p1);
    			append_dev(div, t7);
    			append_dev(div, p2);
    			append_dev(div, t9);
    			append_dev(div, ul);
    			append_dev(ul, li0);
    			append_dev(ul, t11);
    			append_dev(ul, li1);
    			append_dev(ul, t13);
    			append_dev(ul, li2);
    			append_dev(div, t15);
    			append_dev(div, p3);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(11:0) <ContentWrapper>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let appheader;
    	let t;
    	let contentwrapper;
    	let current;

    	appheader = new AppHeader({
    			props: {
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	contentwrapper = new ContentWrapper({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(appheader.$$.fragment);
    			t = space();
    			create_component(contentwrapper.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(appheader, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(contentwrapper, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const appheader_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				appheader_changes.$$scope = { dirty, ctx };
    			}

    			appheader.$set(appheader_changes);
    			const contentwrapper_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				contentwrapper_changes.$$scope = { dirty, ctx };
    			}

    			contentwrapper.$set(contentwrapper_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(appheader.$$.fragment, local);
    			transition_in(contentwrapper.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(appheader.$$.fragment, local);
    			transition_out(contentwrapper.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(appheader, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(contentwrapper, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ScreenAbout", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ScreenAbout> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		ContentWrapper,
    		AppHeader,
    		TwentyTwentyOne: _2021
    	});

    	return [];
    }

    class ScreenAbout extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScreenAbout",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/routes/ScreenSignUp.svelte generated by Svelte v3.32.1 */

    const { Object: Object_1$1 } = globals;

    const file$6 = "src/routes/ScreenSignUp.svelte";

    // (73:0) <AppHeader>
    function create_default_slot_1$2(ctx) {
    	let twentytwentyone;
    	let current;
    	twentytwentyone = new _2021({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(twentytwentyone.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(twentytwentyone, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(twentytwentyone.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(twentytwentyone.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(twentytwentyone, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(73:0) <AppHeader>",
    		ctx
    	});

    	return block;
    }

    // (77:0) <ContentWrapper>
    function create_default_slot$2(ctx) {
    	let form;
    	let div1;
    	let label0;
    	let t1;
    	let div0;
    	let input0;
    	let t2;
    	let div3;
    	let label1;
    	let t4;
    	let div2;
    	let input1;
    	let t5;
    	let div5;
    	let label2;
    	let t7;
    	let div4;
    	let input2;
    	let t8;
    	let div7;
    	let label3;
    	let t10;
    	let div6;
    	let input3;
    	let t11;
    	let div9;
    	let label4;
    	let t13;
    	let div8;
    	let input4;
    	let t14;
    	let div10;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "Name";
    			t1 = space();
    			div0 = element("div");
    			input0 = element("input");
    			t2 = space();
    			div3 = element("div");
    			label1 = element("label");
    			label1.textContent = "Initials";
    			t4 = space();
    			div2 = element("div");
    			input1 = element("input");
    			t5 = space();
    			div5 = element("div");
    			label2 = element("label");
    			label2.textContent = "Title";
    			t7 = space();
    			div4 = element("div");
    			input2 = element("input");
    			t8 = space();
    			div7 = element("div");
    			label3 = element("label");
    			label3.textContent = "Email";
    			t10 = space();
    			div6 = element("div");
    			input3 = element("input");
    			t11 = space();
    			div9 = element("div");
    			label4 = element("label");
    			label4.textContent = "Password";
    			t13 = space();
    			div8 = element("div");
    			input4 = element("input");
    			t14 = space();
    			div10 = element("div");
    			button = element("button");
    			button.textContent = "Sign Up";
    			attr_dev(label0, "for", "name");
    			attr_dev(label0, "class", "block text-sm font-medium text-gray-700");
    			add_location(label0, file$6, 79, 6, 1884);
    			attr_dev(input0, "id", "name");
    			attr_dev(input0, "name", "name");
    			attr_dev(input0, "type", "name");
    			attr_dev(input0, "autocomplete", "name");
    			input0.required = true;
    			attr_dev(input0, "placeholder", "Jane Doe");
    			attr_dev(input0, "class", "appearance-none block w-full px-3 py-2 border border-gray-300\n          rounded-md shadow-sm placeholder-gray-400 focus:outline-none\n          focus:ring-blue-500 focus:border-blue-500 sm:text-sm");
    			add_location(input0, file$6, 83, 8, 2012);
    			attr_dev(div0, "class", "mt-1");
    			add_location(div0, file$6, 82, 6, 1985);
    			add_location(div1, file$6, 78, 4, 1872);
    			attr_dev(label1, "for", "initials");
    			attr_dev(label1, "class", "block text-sm font-medium text-gray-700");
    			add_location(label1, file$6, 98, 6, 2478);
    			attr_dev(input1, "id", "initials");
    			attr_dev(input1, "name", "initials");
    			attr_dev(input1, "type", "initials");
    			attr_dev(input1, "autocomplete", "initials");
    			input1.required = true;
    			attr_dev(input1, "placeholder", "JD");
    			attr_dev(input1, "class", "appearance-none block w-full px-3 py-2 border border-gray-300\n          rounded-md shadow-sm placeholder-gray-400 focus:outline-none\n          focus:ring-blue-500 focus:border-blue-500 sm:text-sm");
    			add_location(input1, file$6, 102, 8, 2614);
    			attr_dev(div2, "class", "mt-1");
    			add_location(div2, file$6, 101, 6, 2587);
    			add_location(div3, file$6, 97, 4, 2466);
    			attr_dev(label2, "for", "title");
    			attr_dev(label2, "class", "block text-sm font-medium text-gray-700");
    			add_location(label2, file$6, 117, 6, 3094);
    			attr_dev(input2, "id", "title");
    			attr_dev(input2, "name", "title");
    			attr_dev(input2, "type", "title");
    			attr_dev(input2, "autocomplete", "title");
    			input2.required = true;
    			attr_dev(input2, "placeholder", "Guardian of the Galaxy");
    			attr_dev(input2, "class", "appearance-none block w-full px-3 py-2 border border-gray-300\n          rounded-md shadow-sm placeholder-gray-400 focus:outline-none\n          focus:ring-blue-500 focus:border-blue-500 sm:text-sm");
    			add_location(input2, file$6, 121, 8, 3224);
    			attr_dev(div4, "class", "mt-1");
    			add_location(div4, file$6, 120, 6, 3197);
    			add_location(div5, file$6, 116, 4, 3082);
    			attr_dev(label3, "for", "email");
    			attr_dev(label3, "class", "block text-sm font-medium text-gray-700");
    			add_location(label3, file$6, 136, 6, 3709);
    			attr_dev(input3, "id", "email");
    			attr_dev(input3, "name", "email");
    			attr_dev(input3, "type", "email");
    			attr_dev(input3, "autocomplete", "email");
    			input3.required = true;
    			attr_dev(input3, "placeholder", "janedoe@domain.com");
    			attr_dev(input3, "class", "appearance-none block w-full px-3 py-2 border border-gray-300\n          rounded-md shadow-sm placeholder-gray-400 focus:outline-none\n          focus:ring-blue-500 focus:border-blue-500 sm:text-sm");
    			add_location(input3, file$6, 140, 8, 3839);
    			attr_dev(div6, "class", "mt-1");
    			add_location(div6, file$6, 139, 6, 3812);
    			add_location(div7, file$6, 135, 4, 3697);
    			attr_dev(label4, "for", "password");
    			attr_dev(label4, "class", "block text-sm font-medium text-gray-700");
    			add_location(label4, file$6, 155, 6, 4320);
    			attr_dev(input4, "id", "password");
    			attr_dev(input4, "name", "password");
    			attr_dev(input4, "type", "password");
    			attr_dev(input4, "autocomplete", "password");
    			input4.required = true;
    			attr_dev(input4, "placeholder", "*****");
    			attr_dev(input4, "class", "appearance-none block w-full px-3 py-2 border border-gray-300\n          rounded-md shadow-sm placeholder-gray-400 focus:outline-none\n          focus:ring-blue-500 focus:border-blue-500 sm:text-sm");
    			add_location(input4, file$6, 159, 8, 4456);
    			attr_dev(div8, "class", "mt-1");
    			add_location(div8, file$6, 158, 6, 4429);
    			add_location(div9, file$6, 154, 4, 4308);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "w-full flex justify-center py-2 px-4 border border-transparent\n        rounded-md shadow-sm text-sm font-bold text-white bg-blue-900\n        hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2\n        focus:ring-blue-500");
    			add_location(button, file$6, 174, 6, 4939);
    			add_location(div10, file$6, 173, 4, 4927);
    			attr_dev(form, "class", "space-y-6");
    			add_location(form, file$6, 77, 2, 1803);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div1);
    			append_dev(div1, label0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, input0);
    			set_input_value(input0, /*tempLocalUserProfile*/ ctx[0].detailName);
    			append_dev(form, t2);
    			append_dev(form, div3);
    			append_dev(div3, label1);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, input1);
    			set_input_value(input1, /*tempLocalUserProfile*/ ctx[0].detailInitials);
    			append_dev(form, t5);
    			append_dev(form, div5);
    			append_dev(div5, label2);
    			append_dev(div5, t7);
    			append_dev(div5, div4);
    			append_dev(div4, input2);
    			set_input_value(input2, /*tempLocalUserProfile*/ ctx[0].detailTitle);
    			append_dev(form, t8);
    			append_dev(form, div7);
    			append_dev(div7, label3);
    			append_dev(div7, t10);
    			append_dev(div7, div6);
    			append_dev(div6, input3);
    			set_input_value(input3, /*tempLocalUserProfile*/ ctx[0].detailEmail);
    			append_dev(form, t11);
    			append_dev(form, div9);
    			append_dev(div9, label4);
    			append_dev(div9, t13);
    			append_dev(div9, div8);
    			append_dev(div8, input4);
    			set_input_value(input4, /*tempLocalUserProfile*/ ctx[0].detailPassword);
    			append_dev(form, t14);
    			append_dev(form, div10);
    			append_dev(div10, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[2]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[3]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[4]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[5]),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[6]),
    					listen_dev(form, "submit", prevent_default(/*handleSignUp*/ ctx[1]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tempLocalUserProfile*/ 1) {
    				set_input_value(input0, /*tempLocalUserProfile*/ ctx[0].detailName);
    			}

    			if (dirty & /*tempLocalUserProfile*/ 1) {
    				set_input_value(input1, /*tempLocalUserProfile*/ ctx[0].detailInitials);
    			}

    			if (dirty & /*tempLocalUserProfile*/ 1) {
    				set_input_value(input2, /*tempLocalUserProfile*/ ctx[0].detailTitle);
    			}

    			if (dirty & /*tempLocalUserProfile*/ 1 && input3.value !== /*tempLocalUserProfile*/ ctx[0].detailEmail) {
    				set_input_value(input3, /*tempLocalUserProfile*/ ctx[0].detailEmail);
    			}

    			if (dirty & /*tempLocalUserProfile*/ 1 && input4.value !== /*tempLocalUserProfile*/ ctx[0].detailPassword) {
    				set_input_value(input4, /*tempLocalUserProfile*/ ctx[0].detailPassword);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(77:0) <ContentWrapper>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let appheader;
    	let t;
    	let contentwrapper;
    	let current;

    	appheader = new AppHeader({
    			props: {
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	contentwrapper = new ContentWrapper({
    			props: {
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(appheader.$$.fragment);
    			t = space();
    			create_component(contentwrapper.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(appheader, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(contentwrapper, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const appheader_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				appheader_changes.$$scope = { dirty, ctx };
    			}

    			appheader.$set(appheader_changes);
    			const contentwrapper_changes = {};

    			if (dirty & /*$$scope, tempLocalUserProfile*/ 513) {
    				contentwrapper_changes.$$scope = { dirty, ctx };
    			}

    			contentwrapper.$set(contentwrapper_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(appheader.$$.fragment, local);
    			transition_in(contentwrapper.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(appheader.$$.fragment, local);
    			transition_out(contentwrapper.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(appheader, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(contentwrapper, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $getUserProfileBlank;
    	let $API_ENDPOINT;
    	validate_store(getUserProfileBlank, "getUserProfileBlank");
    	component_subscribe($$self, getUserProfileBlank, $$value => $$invalidate(7, $getUserProfileBlank = $$value));
    	validate_store(API_ENDPOINT, "API_ENDPOINT");
    	component_subscribe($$self, API_ENDPOINT, $$value => $$invalidate(8, $API_ENDPOINT = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ScreenSignUp", slots, []);
    	let tempLocalUserProfile = $getUserProfileBlank();

    	const handleSignUp = async () => {
    		Object.assign(tempLocalUserProfile, {
    			detailEmail: tempLocalUserProfile.detailEmail.toLocaleLowerCase()
    		});

    		const fetchURL = $API_ENDPOINT + "/users";

    		const fetchOptions = {
    			method: "POST",
    			headers: { "content-type": "application/json" },
    			body: JSON.stringify({ ...tempLocalUserProfile })
    		};

    		const handleErrors = res => {
    			if (!res.ok) {
    				return res.text().then(text => {
    					throw text;
    				});
    			}

    			return res.json();
    		};

    		await fetch(fetchURL, fetchOptions).then(handleErrors).then(res => {
    			// console.log("res", res);
    			userAuth.set(res.userAuth);

    			userId.set(res.userProfile.adminIdUser);
    			userProfile.set(res.userProfile);
    			userHabitsActive.set([{}, {}, {}]);
    			userHabitsHistory.set([]);
    			isLSDataOutdated.set(true);
    		}).catch(err => {
    			// console.clear();
    			errMessage.set(err);

    			push(`/error`);
    		});
    	};

    	onMount(() => {
    		$$invalidate(0, tempLocalUserProfile.adminDateCreated = new Date(), tempLocalUserProfile);
    	});

    	const writable_props = [];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ScreenSignUp> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		tempLocalUserProfile.detailName = this.value;
    		$$invalidate(0, tempLocalUserProfile);
    	}

    	function input1_input_handler() {
    		tempLocalUserProfile.detailInitials = this.value;
    		$$invalidate(0, tempLocalUserProfile);
    	}

    	function input2_input_handler() {
    		tempLocalUserProfile.detailTitle = this.value;
    		$$invalidate(0, tempLocalUserProfile);
    	}

    	function input3_input_handler() {
    		tempLocalUserProfile.detailEmail = this.value;
    		$$invalidate(0, tempLocalUserProfile);
    	}

    	function input4_input_handler() {
    		tempLocalUserProfile.detailPassword = this.value;
    		$$invalidate(0, tempLocalUserProfile);
    	}

    	$$self.$capture_state = () => ({
    		ContentWrapper,
    		AppHeader,
    		TwentyTwentyOne: _2021,
    		push,
    		onMount,
    		errMessage,
    		API_ENDPOINT,
    		contentHabitDetailCategory,
    		userId,
    		userAuth,
    		userProfile,
    		userHabitsActive,
    		userHabitsHistory,
    		isLSDataOutdated,
    		getUserProfileBlank,
    		tempLocalUserProfile,
    		handleSignUp,
    		$getUserProfileBlank,
    		$API_ENDPOINT
    	});

    	$$self.$inject_state = $$props => {
    		if ("tempLocalUserProfile" in $$props) $$invalidate(0, tempLocalUserProfile = $$props.tempLocalUserProfile);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		tempLocalUserProfile,
    		handleSignUp,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler
    	];
    }

    class ScreenSignUp extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScreenSignUp",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    // src/generator.ts
    function isSimpleDeriver(deriver) {
      return deriver.length < 2;
    }
    function generator(storage) {
      function readable(key, value, start) {
        return {
          subscribe: writable$1(key, value, start).subscribe
        };
      }
      function writable$1(key, value, start = noop) {
        function wrap_start(ogSet) {
          return start(function wrap_set(new_value) {
            if (storage) {
              storage.setItem(key, JSON.stringify(new_value));
            }
            return ogSet(new_value);
          });
        }
        if (storage) {
          if (storage.getItem(key)) {
            value = JSON.parse(storage.getItem(key));
          }
          storage.setItem(key, JSON.stringify(value));
        }
        const ogStore = writable(value, start ? wrap_start : void 0);
        function set(new_value) {
          if (storage) {
            storage.setItem(key, JSON.stringify(new_value));
          }
          ogStore.set(new_value);
        }
        function update(fn) {
          set(fn(get_store_value(ogStore)));
        }
        function subscribe(run, invalidate = noop) {
          return ogStore.subscribe(run, invalidate);
        }
        return {set, update, subscribe};
      }
      function derived(key, stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single ? [stores] : stores;
        if (storage && storage.getItem(key)) {
          initial_value = JSON.parse(storage.getItem(key));
        }
        return readable(key, initial_value, (set) => {
          let inited = false;
          const values = [];
          let pending = 0;
          let cleanup = noop;
          const sync = () => {
            if (pending) {
              return;
            }
            cleanup();
            const input = single ? values[0] : values;
            if (isSimpleDeriver(fn)) {
              set(fn(input));
            } else {
              const result = fn(input, set);
              cleanup = is_function(result) ? result : noop;
            }
          };
          const unsubscribers = stores_array.map((store, i) => store.subscribe((value) => {
            values[i] = value;
            pending &= ~(1 << i);
            if (inited) {
              sync();
            }
          }, () => {
            pending |= 1 << i;
          }));
          inited = true;
          sync();
          return function stop() {
            run_all(unsubscribers);
            cleanup();
          };
        });
      }
      return {
        readable,
        writable: writable$1,
        derived,
        get: get_store_value
      };
    }

    // src/local.ts
    var storage = typeof window !== "undefined" ? window.localStorage : void 0;
    var g = generator(storage);
    var writable$1 = g.writable;

    const LSuserAuthData = {
    	prop1: null,
    	prop2: null,
    	prop3: null,
    };

    const LSuserProfileData = {
    	adminDateCreated: null,
    	adminOther: {},
    	adminIdPod: null,
    	adminIdUser: null,
    	adminScoreUser: 0,
    	detailEmail: "",
    	detailImage: "",
    	detailInitials: "",
    	detailIsAccountPrivate: null,
    	detailName: "",
    	detailPassword: "",
    	detailSocialAccounts: {},
    	detailTitle: "",
    	habitIdsActive: [],
    	habitIdsHistory: [],
    };

    const LSuserHabitsActiveData = [
    	{
    		prop1: 1,
    	},
    	{
    		prop1: 1,
    	},
    	{
    		prop1: 1,
    	},
    ];

    const LSisUserDefined = writable$1("LSisUserDefined", false);
    const LSuserAuth = writable$1("LSuserAuth", LSuserAuthData);
    const LSuserProfile = writable$1("LSuserProfile", LSuserProfileData);
    const LSuserHabitsActive = writable$1(
    	"LSuserHabitsActive",
    	LSuserHabitsActiveData
    );
    const LSuserHabitsHistory = writable$1("LSuserHabitsHistory", []);

    /* src/routes/ScreenStart.svelte generated by Svelte v3.32.1 */

    const file$7 = "src/routes/ScreenStart.svelte";

    // (91:0) <AppHeader>
    function create_default_slot_1$3(ctx) {
    	let twentytwentyone;
    	let current;
    	twentytwentyone = new _2021({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(twentytwentyone.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(twentytwentyone, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(twentytwentyone.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(twentytwentyone.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(twentytwentyone, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(91:0) <AppHeader>",
    		ctx
    	});

    	return block;
    }

    // (95:0) <ContentWrapper>
    function create_default_slot$3(ctx) {
    	let form;
    	let div1;
    	let label0;
    	let t1;
    	let div0;
    	let input0;
    	let t2;
    	let div3;
    	let label1;
    	let t4;
    	let div2;
    	let input1;
    	let t5;
    	let div4;
    	let button;
    	let t7;
    	let div12;
    	let div8;
    	let div6;
    	let div5;
    	let t8;
    	let div7;
    	let span0;
    	let t10;
    	let div11;
    	let div9;
    	let a0;
    	let span1;
    	let t12;
    	let div10;
    	let a1;
    	let span2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "Email address";
    			t1 = space();
    			div0 = element("div");
    			input0 = element("input");
    			t2 = space();
    			div3 = element("div");
    			label1 = element("label");
    			label1.textContent = "Password";
    			t4 = space();
    			div2 = element("div");
    			input1 = element("input");
    			t5 = space();
    			div4 = element("div");
    			button = element("button");
    			button.textContent = "Sign in";
    			t7 = space();
    			div12 = element("div");
    			div8 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			t8 = space();
    			div7 = element("div");
    			span0 = element("span");
    			span0.textContent = "Or";
    			t10 = space();
    			div11 = element("div");
    			div9 = element("div");
    			a0 = element("a");
    			span1 = element("span");
    			span1.textContent = "Sign Up";
    			t12 = space();
    			div10 = element("div");
    			a1 = element("a");
    			span2 = element("span");
    			span2.textContent = "Learn More";
    			attr_dev(label0, "for", "email");
    			attr_dev(label0, "class", "block text-sm font-medium text-gray-700");
    			add_location(label0, file$7, 97, 6, 2410);
    			attr_dev(input0, "id", "email");
    			attr_dev(input0, "name", "email");
    			attr_dev(input0, "type", "email");
    			attr_dev(input0, "autocomplete", "email");
    			input0.required = true;
    			attr_dev(input0, "class", "appearance-none block w-full px-3 py-2 border border-gray-300\n          rounded-md shadow-sm placeholder-gray-400 focus:outline-none\n          focus:ring-blue-500 focus:border-blue-500 sm:text-sm");
    			add_location(input0, file$7, 101, 8, 2548);
    			attr_dev(div0, "class", "mt-1");
    			add_location(div0, file$7, 100, 6, 2521);
    			add_location(div1, file$7, 96, 4, 2398);
    			attr_dev(label1, "for", "password");
    			attr_dev(label1, "class", "block text-sm font-medium text-gray-700");
    			add_location(label1, file$7, 115, 6, 2968);
    			attr_dev(input1, "id", "password");
    			attr_dev(input1, "name", "password");
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "autocomplete", "password");
    			input1.required = true;
    			attr_dev(input1, "class", "appearance-none block w-full px-3 py-2 border border-gray-300\n          rounded-md shadow-sm placeholder-gray-400 focus:outline-none\n          focus:ring-blue-500 focus:border-blue-500 sm:text-sm");
    			add_location(input1, file$7, 119, 8, 3104);
    			attr_dev(div2, "class", "mt-1");
    			add_location(div2, file$7, 118, 6, 3077);
    			add_location(div3, file$7, 114, 4, 2956);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "w-full flex justify-center py-2 px-4 border border-transparent\n        rounded-md shadow-sm text-sm font-medium text-white bg-blue-600\n        hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2\n        focus:ring-blue-500");
    			add_location(button, file$7, 133, 6, 3539);
    			add_location(div4, file$7, 132, 4, 3527);
    			attr_dev(form, "class", "space-y-6");
    			add_location(form, file$7, 95, 2, 2329);
    			attr_dev(div5, "class", "w-full border-t border-gray-300");
    			add_location(div5, file$7, 147, 8, 3992);
    			attr_dev(div6, "class", "absolute inset-0 flex items-center");
    			add_location(div6, file$7, 146, 6, 3935);
    			attr_dev(span0, "class", "px-2 bg-white text-gray-500");
    			add_location(span0, file$7, 150, 8, 4118);
    			attr_dev(div7, "class", "relative flex justify-center text-sm");
    			add_location(div7, file$7, 149, 6, 4059);
    			attr_dev(div8, "class", "relative");
    			add_location(div8, file$7, 145, 4, 3906);
    			attr_dev(span1, "class", "");
    			add_location(span1, file$7, 161, 10, 4487);
    			attr_dev(a0, "href", "#/signup");
    			attr_dev(a0, "class", "w-full inline-flex justify-center py-2 px-4 border\n          border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium\n          text-gray-500 hover:bg-gray-50");
    			add_location(a0, file$7, 156, 8, 4261);
    			add_location(div9, file$7, 155, 6, 4247);
    			attr_dev(span2, "class", "");
    			add_location(span2, file$7, 171, 10, 4789);
    			attr_dev(a1, "href", "#/about");
    			attr_dev(a1, "class", "w-full inline-flex justify-center py-2 px-4 border\n          border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium\n          text-gray-500 hover:bg-gray-50");
    			add_location(a1, file$7, 166, 8, 4564);
    			add_location(div10, file$7, 165, 6, 4550);
    			attr_dev(div11, "class", "mt-6 grid grid-cols-2 gap-3");
    			add_location(div11, file$7, 154, 4, 4199);
    			attr_dev(div12, "class", "mt-6");
    			add_location(div12, file$7, 144, 2, 3883);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div1);
    			append_dev(div1, label0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, input0);
    			set_input_value(input0, /*userTemp*/ ctx[0].email);
    			append_dev(form, t2);
    			append_dev(form, div3);
    			append_dev(div3, label1);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, input1);
    			set_input_value(input1, /*userTemp*/ ctx[0].password);
    			append_dev(form, t5);
    			append_dev(form, div4);
    			append_dev(div4, button);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div12, anchor);
    			append_dev(div12, div8);
    			append_dev(div8, div6);
    			append_dev(div6, div5);
    			append_dev(div8, t8);
    			append_dev(div8, div7);
    			append_dev(div7, span0);
    			append_dev(div12, t10);
    			append_dev(div12, div11);
    			append_dev(div11, div9);
    			append_dev(div9, a0);
    			append_dev(a0, span1);
    			append_dev(div11, t12);
    			append_dev(div11, div10);
    			append_dev(div10, a1);
    			append_dev(a1, span2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[2]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[3]),
    					listen_dev(form, "submit", prevent_default(/*handleSignIn*/ ctx[1]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*userTemp*/ 1 && input0.value !== /*userTemp*/ ctx[0].email) {
    				set_input_value(input0, /*userTemp*/ ctx[0].email);
    			}

    			if (dirty & /*userTemp*/ 1 && input1.value !== /*userTemp*/ ctx[0].password) {
    				set_input_value(input1, /*userTemp*/ ctx[0].password);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div12);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(95:0) <ContentWrapper>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let appheader;
    	let t;
    	let contentwrapper;
    	let current;

    	appheader = new AppHeader({
    			props: {
    				$$slots: { default: [create_default_slot_1$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	contentwrapper = new ContentWrapper({
    			props: {
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(appheader.$$.fragment);
    			t = space();
    			create_component(contentwrapper.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(appheader, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(contentwrapper, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const appheader_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				appheader_changes.$$scope = { dirty, ctx };
    			}

    			appheader.$set(appheader_changes);
    			const contentwrapper_changes = {};

    			if (dirty & /*$$scope, userTemp*/ 65) {
    				contentwrapper_changes.$$scope = { dirty, ctx };
    			}

    			contentwrapper.$set(contentwrapper_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(appheader.$$.fragment, local);
    			transition_in(contentwrapper.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(appheader.$$.fragment, local);
    			transition_out(contentwrapper.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(appheader, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(contentwrapper, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $API_ENDPOINT;
    	let $isLocalStorage;
    	validate_store(API_ENDPOINT, "API_ENDPOINT");
    	component_subscribe($$self, API_ENDPOINT, $$value => $$invalidate(4, $API_ENDPOINT = $$value));
    	validate_store(isLocalStorage, "isLocalStorage");
    	component_subscribe($$self, isLocalStorage, $$value => $$invalidate(5, $isLocalStorage = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ScreenStart", slots, []);
    	let userTemp = { email: "", password: "" };

    	const handleSignIn = async () => {
    		const fetchURL = $API_ENDPOINT + "/_login";

    		const fetchOptions = {
    			method: "POST",
    			headers: { "content-type": "application/json" },
    			body: JSON.stringify({
    				email: userTemp.email.toLocaleLowerCase(),
    				password: userTemp.password
    			})
    		};

    		const handleErrors = res => {
    			if (!res.ok) {
    				return res.text().then(text => {
    					throw text;
    				});
    			}

    			return res.json();
    		};

    		await fetch(fetchURL, fetchOptions).then(handleErrors).then(res => {
    			// console.log("res", res);
    			userAuth.set(res.userAuth);

    			userProfile.set(res.userProfile);
    			userId.set(res.userProfile.adminIdUser);
    			let tempHabitsActive = res.userHabitsActive;
    			let tempHabitsActiveClean = [{}, {}, {}];

    			for (const habit of tempHabitsActive) {
    				tempHabitsActiveClean[habit.adminActivePosition] = habit;
    			}

    			userHabitsActive.set(tempHabitsActiveClean);
    			userHabitsHistory.set(res.userHabitsHistory);
    			isLSDataOutdated.set(true);
    		}).catch(err => {
    			// console.clear();
    			errMessage.set(err);

    			push(`/error`);
    		});
    	};

    	onMount(() => {
    		// clean all local storage on start screen
    		if ($isLocalStorage) {
    			LSuserAuth.set(null);
    			LSuserProfile.set(null);
    			LSuserHabitsActive.set([null, null, null]);
    			LSuserHabitsHistory.set([]);
    			LSisUserDefined.set(false);
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ScreenStart> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		userTemp.email = this.value;
    		$$invalidate(0, userTemp);
    	}

    	function input1_input_handler() {
    		userTemp.password = this.value;
    		$$invalidate(0, userTemp);
    	}

    	$$self.$capture_state = () => ({
    		ContentWrapper,
    		AppHeader,
    		TwentyTwentyOne: _2021,
    		push,
    		onMount,
    		errMessage,
    		API_ENDPOINT,
    		isLocalStorage,
    		getUserHabitBlank,
    		userAuth,
    		userId,
    		userProfile,
    		userHabitsActive,
    		userHabitsHistory,
    		isLSDataOutdated,
    		LSisUserDefined,
    		LSuserAuth,
    		LSuserProfile,
    		LSuserHabitsActive,
    		LSuserHabitsHistory,
    		userTemp,
    		handleSignIn,
    		$API_ENDPOINT,
    		$isLocalStorage
    	});

    	$$self.$inject_state = $$props => {
    		if ("userTemp" in $$props) $$invalidate(0, userTemp = $$props.userTemp);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [userTemp, handleSignIn, input0_input_handler, input1_input_handler];
    }

    class ScreenStart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScreenStart",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/components/HomeHabitButton.svelte generated by Svelte v3.32.1 */

    const { console: console_1$1 } = globals;
    const file$8 = "src/components/HomeHabitButton.svelte";

    // (154:8) {:else}
    function create_else_block_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Time");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_5.name,
    		type: "else",
    		source: "(154:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (142:8) {#if habit}
    function create_if_block_6(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*habit*/ ctx[0].detailDuration > 86400) return create_if_block_7;
    		if (/*habit*/ ctx[0].detailDuration == 86400) return create_if_block_8;
    		if (/*habit*/ ctx[0].detailDuration > 3600) return create_if_block_9;
    		if (/*habit*/ ctx[0].detailDuration == 3600) return create_if_block_10;
    		if (/*habit*/ ctx[0].detailDuration > 60) return create_if_block_11;
    		return create_else_block_4;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(142:8) {#if habit}",
    		ctx
    	});

    	return block;
    }

    // (153:10) {:else}
    function create_else_block_4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("1 min");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_4.name,
    		type: "else",
    		source: "(153:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (151:46) 
    function create_if_block_11(ctx) {
    	let t0_value = /*habit*/ ctx[0].detailDuration / 60 + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = text(" mins");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*habit*/ 1 && t0_value !== (t0_value = /*habit*/ ctx[0].detailDuration / 60 + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(151:46) ",
    		ctx
    	});

    	return block;
    }

    // (149:49) 
    function create_if_block_10(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("60 mins");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(149:49) ",
    		ctx
    	});

    	return block;
    }

    // (147:48) 
    function create_if_block_9(ctx) {
    	let t0_value = /*habit*/ ctx[0].detailDuration / 3600 + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = text(" hours");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*habit*/ 1 && t0_value !== (t0_value = /*habit*/ ctx[0].detailDuration / 3600 + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(147:48) ",
    		ctx
    	});

    	return block;
    }

    // (145:50) 
    function create_if_block_8(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("24 hours");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(145:50) ",
    		ctx
    	});

    	return block;
    }

    // (143:10) {#if habit.detailDuration > 86400}
    function create_if_block_7(ctx) {
    	let t0_value = /*habit*/ ctx[0].detailDuration / 86400 + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = text(" days");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*habit*/ 1 && t0_value !== (t0_value = /*habit*/ ctx[0].detailDuration / 86400 + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(143:10) {#if habit.detailDuration > 86400}",
    		ctx
    	});

    	return block;
    }

    // (157:37) {:else}
    function create_else_block_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("+");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_3.name,
    		type: "else",
    		source: "(157:37) {:else}",
    		ctx
    	});

    	return block;
    }

    // (157:8) {#if habit}
    function create_if_block_5(ctx) {
    	let t_value = /*habit*/ ctx[0].detailCode + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*habit*/ 1 && t_value !== (t_value = /*habit*/ ctx[0].detailCode + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(157:8) {#if habit}",
    		ctx
    	});

    	return block;
    }

    // (162:8) {:else}
    function create_else_block_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("info");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(162:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (160:8) {#if habit}
    function create_if_block_3(ctx) {
    	let if_block_anchor;

    	function select_block_type_4(ctx, dirty) {
    		if (/*habit*/ ctx[0].adminIsActive) return create_if_block_4;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_4(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_4(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(160:8) {#if habit}",
    		ctx
    	});

    	return block;
    }

    // (161:53) {:else}
    function create_else_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("complete");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(161:53) {:else}",
    		ctx
    	});

    	return block;
    }

    // (161:10) {#if habit.adminIsActive}
    function create_if_block_4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*timeUpdateFormat*/ ctx[2]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*timeUpdateFormat*/ 4) set_data_dev(t, /*timeUpdateFormat*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(161:10) {#if habit.adminIsActive}",
    		ctx
    	});

    	return block;
    }

    // (203:4) {:else}
    function create_else_block$1(ctx) {
    	let div;
    	let button;
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			span = element("span");
    			span.textContent = "ADD";
    			attr_dev(span, "class", "border-2 rounded-sm border-black bg-green-100 p-1 text-xs\n            font-extrabold align-middle");
    			add_location(span, file$8, 210, 10, 6392);
    			set_style(button, "height", "32px");
    			attr_dev(button, "class", "flex justify-center items-center focus:ring-1 outline-none\n          focus:ring-offset-1 focus:ring-green-500 focus:outline-none\n          transition-colors duration-75");
    			add_location(button, file$8, 204, 8, 6119);
    			attr_dev(div, "class", "py-1 flex justify-center items-center space-x-2");
    			add_location(div, file$8, 203, 6, 6049);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(button, span);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleHabitAdd*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(203:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (168:4) {#if habit}
    function create_if_block$1(ctx) {
    	let if_block_anchor;

    	function select_block_type_6(ctx, dirty) {
    		if (!/*habit*/ ctx[0].adminIsActive && /*$indexActiveHabit*/ ctx[3] === /*i*/ ctx[1]) return create_if_block_1;
    		if (/*$indexActiveHabit*/ ctx[3] === /*i*/ ctx[1]) return create_if_block_2;
    	}

    	let current_block_type = select_block_type_6(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_6(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(168:4) {#if habit}",
    		ctx
    	});

    	return block;
    }

    // (184:40) 
    function create_if_block_2(ctx) {
    	let div;
    	let button0;
    	let i0;
    	let t;
    	let button1;
    	let i1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			i0 = element("i");
    			t = space();
    			button1 = element("button");
    			i1 = element("i");
    			attr_dev(i0, "class", "bg-green-100 far fa-2x fa-check-square");
    			add_location(i0, file$8, 191, 12, 5585);
    			attr_dev(button0, "class", "flex justify-center items-center focus:ring-1 outline-none\n            focus:ring-offset-1 focus:ring-green-500 focus:outline-none\n            transition-colors duration-75");
    			add_location(button0, file$8, 185, 10, 5282);
    			attr_dev(i1, "class", "bg-red-100 far fa-2x fa-window-close");
    			add_location(i1, file$8, 198, 12, 5933);
    			attr_dev(button1, "class", "flex justify-center items-center focus:ring-1 outline-none\n            focus:ring-offset-1 focus:ring-red-500 focus:outline-none\n            transition-colors duration-75");
    			add_location(button1, file$8, 193, 10, 5668);
    			attr_dev(div, "class", "py-1 flex justify-center items-center space-x-2");
    			add_location(div, file$8, 184, 8, 5210);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(button0, i0);
    			append_dev(div, t);
    			append_dev(div, button1);
    			append_dev(button1, i1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[10], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(184:40) ",
    		ctx
    	});

    	return block;
    }

    // (169:6) {#if !habit.adminIsActive && $indexActiveHabit === i}
    function create_if_block_1(ctx) {
    	let div;
    	let button;
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			span = element("span");
    			span.textContent = "Reflect";
    			attr_dev(span, "class", "border-2 rounded-sm border-black bg-green-100 p-1 text-xs\n              font-extrabold align-middle");
    			add_location(span, file$8, 176, 12, 4955);
    			set_style(button, "height", "32px");
    			attr_dev(button, "class", "flex justify-center items-center focus:ring-1 outline-none\n            focus:ring-offset-1 focus:ring-green-500 focus:outline-none\n            transition-colors duration-75");
    			add_location(button, file$8, 170, 10, 4666);
    			attr_dev(div, "class", "py-1 flex justify-center items-center space-x-2");
    			add_location(div, file$8, 169, 8, 4594);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(button, span);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleHabitReflect*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(169:6) {#if !habit.adminIsActive && $indexActiveHabit === i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div5;
    	let button;
    	let div3;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;
    	let t2;
    	let div4;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*habit*/ ctx[0]) return create_if_block_6;
    		return create_else_block_5;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_2(ctx, dirty) {
    		if (/*habit*/ ctx[0]) return create_if_block_5;
    		return create_else_block_3;
    	}

    	let current_block_type_1 = select_block_type_2(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	function select_block_type_3(ctx, dirty) {
    		if (/*habit*/ ctx[0]) return create_if_block_3;
    		return create_else_block_2;
    	}

    	let current_block_type_2 = select_block_type_3(ctx);
    	let if_block2 = current_block_type_2(ctx);

    	function select_block_type_5(ctx, dirty) {
    		if (/*habit*/ ctx[0]) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type_3 = select_block_type_5(ctx);
    	let if_block3 = current_block_type_3(ctx);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			button = element("button");
    			div3 = element("div");
    			div0 = element("div");
    			if_block0.c();
    			t0 = space();
    			div1 = element("div");
    			if_block1.c();
    			t1 = space();
    			div2 = element("div");
    			if_block2.c();
    			t2 = space();
    			div4 = element("div");
    			if_block3.c();
    			attr_dev(div0, "class", "uppercase font-extrabold text-gray-900 text-xs text-left");
    			add_location(div0, file$8, 140, 6, 3484);
    			attr_dev(div1, "class", "mt-1 text-6xl font-extrabold text-center text-blue-900");
    			add_location(div1, file$8, 155, 6, 4071);
    			attr_dev(div2, "class", "mt-2 text-sm font-bold text-center text-gray-500 uppercase");
    			add_location(div2, file$8, 158, 6, 4210);
    			attr_dev(div3, "class", "flex flex-col mx-auto");
    			add_location(div3, file$8, 139, 4, 3442);
    			attr_dev(button, "class", "bg-white py-1 px-2 border-2 border-blue-100 shadow rounded-sm\n    hover:bg-blue-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-700\n    focus:outline-none transition-colors duration-75 svelte-6i48u6");
    			toggle_class(button, "selected", /*$indexActiveHabit*/ ctx[3] === /*i*/ ctx[1] || /*$indexActiveHabit*/ ctx[3] === null && !/*habit*/ ctx[0].adminIsActive);
    			add_location(button, file$8, 133, 2, 3099);
    			attr_dev(div4, "class", "bg-white mt-2 shadow rounded-sm sm:rounded-lg sm:px-10");
    			add_location(div4, file$8, 166, 2, 4441);
    			attr_dev(div5, "class", "flex flex-col");
    			add_location(div5, file$8, 132, 0, 3069);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, button);
    			append_dev(button, div3);
    			append_dev(div3, div0);
    			if_block0.m(div0, null);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			if_block1.m(div1, null);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			if_block2.m(div2, null);
    			append_dev(div5, t2);
    			append_dev(div5, div4);
    			if_block3.m(div4, null);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleClick*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_2(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			}

    			if (current_block_type_2 === (current_block_type_2 = select_block_type_3(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type_2(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div2, null);
    				}
    			}

    			if (dirty & /*$indexActiveHabit, i, habit*/ 11) {
    				toggle_class(button, "selected", /*$indexActiveHabit*/ ctx[3] === /*i*/ ctx[1] || /*$indexActiveHabit*/ ctx[3] === null && !/*habit*/ ctx[0].adminIsActive);
    			}

    			if (current_block_type_3 === (current_block_type_3 = select_block_type_5(ctx)) && if_block3) {
    				if_block3.p(ctx, dirty);
    			} else {
    				if_block3.d(1);
    				if_block3 = current_block_type_3(ctx);

    				if (if_block3) {
    					if_block3.c();
    					if_block3.m(div4, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			if_block0.d();
    			if_block1.d();
    			if_block2.d();
    			if_block3.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $API_ENDPOINT;
    	let $userHabitsActive;
    	let $indexActiveHabit;
    	validate_store(API_ENDPOINT, "API_ENDPOINT");
    	component_subscribe($$self, API_ENDPOINT, $$value => $$invalidate(15, $API_ENDPOINT = $$value));
    	validate_store(userHabitsActive, "userHabitsActive");
    	component_subscribe($$self, userHabitsActive, $$value => $$invalidate(16, $userHabitsActive = $$value));
    	validate_store(indexActiveHabit, "indexActiveHabit");
    	component_subscribe($$self, indexActiveHabit, $$value => $$invalidate(3, $indexActiveHabit = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("HomeHabitButton", slots, []);
    	let { habit } = $$props;
    	let { i } = $$props;
    	let dateStart = new Date(habit.adminDateStartUTCString).getTime();
    	let dateEnd = new Date(habit.adminDateEndUTCString).getTime();
    	let dateCurrent = new Date().getTime();
    	let timeRemaining = Math.round((dateEnd - dateCurrent) / 1000);
    	let isTimeUpdating = true;

    	const handleClick = () => {
    		indexActiveHabit.set(i);
    	};

    	const handleHabitAdd = () => {
    		push("/add");
    	};

    	const handleHabitReflect = () => {
    		push("/reflect");
    	};

    	const handleComplete = () => {
    		console.log("COMPLETE ", i);
    		$$invalidate(9, isTimeUpdating = false);
    	};

    	const handleHabitCheck = async val => {
    		let tempLocalUserHabit = habit;
    		tempLocalUserHabit.checks.push({ date: new Date(), isOk: val });
    		const fetchURL = $API_ENDPOINT + `/habits/${tempLocalUserHabit.adminIdHabit}`;

    		const fetchOptions = {
    			method: "PATCH",
    			headers: { "content-type": "application/json" },
    			body: JSON.stringify({ ...tempLocalUserHabit })
    		};

    		const handleErrors = res => {
    			if (!res.ok) {
    				return res.text().then(text => {
    					throw text;
    				});
    			}

    			return res.json();
    		};

    		await fetch(fetchURL, fetchOptions).then(handleErrors).then(res => {
    			// console.log("res", res);
    			let tempHabitsActive = $userHabitsActive;

    			tempHabitsActive[$indexActiveHabit] = res.updatedHabit;
    			userHabitsActive.set(tempHabitsActive);
    			isLSDataOutdated.set(true);
    		}).catch(err => {
    			// console.clear();
    			errMessage.set(err);

    			push(`/error`);
    		});
    	};

    	const handleHabitIsComplete = () => {
    		let tempHabitsActive = $userHabitsActive;
    		tempHabitsActive[i].adminIsActive = false;
    		userHabitsActive.set(tempHabitsActive);
    	};

    	let val, unit;

    	const formatTimeRemaining = time => {
    		if (time > 86400) {
    			val = time / 3600 / 24;
    			unit = "days";
    		} else if (time > 3600) {
    			val = time / 3600;
    			unit = "hrs";
    		} else if (time > 60) {
    			val = time / 60;
    			unit = "min";
    		} else {
    			val = time;
    			unit = "sec";
    		}

    		return `${val.toFixed(0)} ${unit}`;
    	};

    	const updateTimeInterval = setInterval(
    		() => {
    			if (isTimeUpdating) {
    				$$invalidate(8, timeRemaining--, timeRemaining);
    			}
    		},
    		1000
    	);

    	let timeUpdateFormat = formatTimeRemaining(timeRemaining);

    	const updateTime = () => {
    		if (timeRemaining > 0) {
    			$$invalidate(2, timeUpdateFormat = formatTimeRemaining(timeRemaining));
    		} else {
    			dateCurrent = false;
    			$$invalidate(2, timeUpdateFormat = 0);
    			clearInterval(updateTimeInterval);
    			handleHabitIsComplete();
    		}
    	};

    	const writable_props = ["habit", "i"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<HomeHabitButton> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => handleHabitCheck(true);
    	const click_handler_1 = () => handleHabitCheck(false);

    	$$self.$$set = $$props => {
    		if ("habit" in $$props) $$invalidate(0, habit = $$props.habit);
    		if ("i" in $$props) $$invalidate(1, i = $$props.i);
    	};

    	$$self.$capture_state = () => ({
    		errMessage,
    		API_ENDPOINT,
    		indexActiveHabit,
    		userHabitsActive,
    		isLSDataOutdated,
    		push,
    		habit,
    		i,
    		dateStart,
    		dateEnd,
    		dateCurrent,
    		timeRemaining,
    		isTimeUpdating,
    		handleClick,
    		handleHabitAdd,
    		handleHabitReflect,
    		handleComplete,
    		handleHabitCheck,
    		handleHabitIsComplete,
    		val,
    		unit,
    		formatTimeRemaining,
    		updateTimeInterval,
    		timeUpdateFormat,
    		updateTime,
    		$API_ENDPOINT,
    		$userHabitsActive,
    		$indexActiveHabit
    	});

    	$$self.$inject_state = $$props => {
    		if ("habit" in $$props) $$invalidate(0, habit = $$props.habit);
    		if ("i" in $$props) $$invalidate(1, i = $$props.i);
    		if ("dateStart" in $$props) dateStart = $$props.dateStart;
    		if ("dateEnd" in $$props) dateEnd = $$props.dateEnd;
    		if ("dateCurrent" in $$props) dateCurrent = $$props.dateCurrent;
    		if ("timeRemaining" in $$props) $$invalidate(8, timeRemaining = $$props.timeRemaining);
    		if ("isTimeUpdating" in $$props) $$invalidate(9, isTimeUpdating = $$props.isTimeUpdating);
    		if ("val" in $$props) val = $$props.val;
    		if ("unit" in $$props) unit = $$props.unit;
    		if ("timeUpdateFormat" in $$props) $$invalidate(2, timeUpdateFormat = $$props.timeUpdateFormat);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*timeRemaining, isTimeUpdating*/ 768) {
    			 timeRemaining && isTimeUpdating ? updateTime() : "";
    		}
    	};

    	return [
    		habit,
    		i,
    		timeUpdateFormat,
    		$indexActiveHabit,
    		handleClick,
    		handleHabitAdd,
    		handleHabitReflect,
    		handleHabitCheck,
    		timeRemaining,
    		isTimeUpdating,
    		click_handler,
    		click_handler_1
    	];
    }

    class HomeHabitButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { habit: 0, i: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HomeHabitButton",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*habit*/ ctx[0] === undefined && !("habit" in props)) {
    			console_1$1.warn("<HomeHabitButton> was created without expected prop 'habit'");
    		}

    		if (/*i*/ ctx[1] === undefined && !("i" in props)) {
    			console_1$1.warn("<HomeHabitButton> was created without expected prop 'i'");
    		}
    	}

    	get habit() {
    		throw new Error("<HomeHabitButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set habit(value) {
    		throw new Error("<HomeHabitButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get i() {
    		throw new Error("<HomeHabitButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set i(value) {
    		throw new Error("<HomeHabitButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/HomeHabitButtonNull.svelte generated by Svelte v3.32.1 */
    const file$9 = "src/components/HomeHabitButtonNull.svelte";

    // (43:4) {#if $indexActiveHabit === i}
    function create_if_block$2(ctx) {
    	let div;
    	let button;
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			span = element("span");
    			span.textContent = "ADD";
    			attr_dev(span, "class", "border-2 rounded-sm border-black bg-green-100 p-1 text-xs\n            font-extrabold align-middle");
    			add_location(span, file$9, 50, 10, 1563);
    			set_style(button, "height", "32px");
    			attr_dev(button, "class", "flex justify-center items-center focus:ring-1 outline-none\n          focus:ring-offset-1 focus:ring-green-500 focus:outline-none\n          transition-colors duration-75");
    			add_location(button, file$9, 44, 8, 1290);
    			attr_dev(div, "class", "py-1 flex justify-center items-center space-x-2");
    			add_location(div, file$9, 43, 6, 1220);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(button, span);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleHabitAdd*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(43:4) {#if $indexActiveHabit === i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div5;
    	let button;
    	let div3;
    	let div0;
    	let t1;
    	let div1;
    	let t3;
    	let div2;
    	let t5;
    	let div4;
    	let mounted;
    	let dispose;
    	let if_block = /*$indexActiveHabit*/ ctx[1] === /*i*/ ctx[0] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			button = element("button");
    			div3 = element("div");
    			div0 = element("div");
    			div0.textContent = "Time";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "+";
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "info";
    			t5 = space();
    			div4 = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "uppercase font-extrabold text-gray-900 text-xs text-left");
    			add_location(div0, file$9, 29, 6, 785);
    			attr_dev(div1, "class", "mt-1 text-6xl font-extrabold text-center text-blue-900");
    			add_location(div1, file$9, 32, 6, 888);
    			attr_dev(div2, "class", "mt-2 text-sm font-bold text-center text-gray-500 uppercase");
    			add_location(div2, file$9, 35, 6, 986);
    			attr_dev(div3, "class", "flex flex-col mx-auto");
    			add_location(div3, file$9, 28, 4, 743);
    			attr_dev(button, "class", "bg-white py-1 px-2 border-2 border-blue-100 shadow rounded-sm\n    hover:bg-blue-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-700\n    focus:outline-none transition-colors duration-75 svelte-6i48u6");
    			toggle_class(button, "selected", /*$indexActiveHabit*/ ctx[1] === /*i*/ ctx[0] || /*$indexActiveHabit*/ ctx[1] === null && !habit.adminIsActive);
    			add_location(button, file$9, 22, 2, 400);
    			attr_dev(div4, "class", "bg-white mt-2 shadow rounded-sm sm:rounded-lg sm:px-10");
    			add_location(div4, file$9, 41, 2, 1111);
    			attr_dev(div5, "class", "flex flex-col");
    			add_location(div5, file$9, 21, 0, 370);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, button);
    			append_dev(button, div3);
    			append_dev(div3, div0);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div5, t5);
    			append_dev(div5, div4);
    			if (if_block) if_block.m(div4, null);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleClick*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$indexActiveHabit, i, habit*/ 3) {
    				toggle_class(button, "selected", /*$indexActiveHabit*/ ctx[1] === /*i*/ ctx[0] || /*$indexActiveHabit*/ ctx[1] === null && !habit.adminIsActive);
    			}

    			if (/*$indexActiveHabit*/ ctx[1] === /*i*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(div4, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $indexActiveHabit;
    	validate_store(indexActiveHabit, "indexActiveHabit");
    	component_subscribe($$self, indexActiveHabit, $$value => $$invalidate(1, $indexActiveHabit = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("HomeHabitButtonNull", slots, []);
    	let { i } = $$props;

    	const handleClick = () => {
    		indexActiveHabit.set(i);
    	};

    	const handleHabitAdd = () => {
    		push("/add");
    	};

    	const writable_props = ["i"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<HomeHabitButtonNull> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("i" in $$props) $$invalidate(0, i = $$props.i);
    	};

    	$$self.$capture_state = () => ({
    		indexActiveHabit,
    		push,
    		i,
    		handleClick,
    		handleHabitAdd,
    		$indexActiveHabit
    	});

    	$$self.$inject_state = $$props => {
    		if ("i" in $$props) $$invalidate(0, i = $$props.i);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [i, $indexActiveHabit, handleClick, handleHabitAdd];
    }

    class HomeHabitButtonNull extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { i: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HomeHabitButtonNull",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*i*/ ctx[0] === undefined && !("i" in props)) {
    			console.warn("<HomeHabitButtonNull> was created without expected prop 'i'");
    		}
    	}

    	get i() {
    		throw new Error("<HomeHabitButtonNull>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set i(value) {
    		throw new Error("<HomeHabitButtonNull>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Modal.svelte generated by Svelte v3.32.1 */
    const file$a = "src/components/Modal.svelte";

    function create_fragment$b(ctx) {
    	let div9;
    	let div8;
    	let div1;
    	let div0;
    	let t0;
    	let span;
    	let t2;
    	let div7;
    	let div5;
    	let div2;
    	let svg;
    	let path;
    	let t3;
    	let div4;
    	let h3;
    	let t4_value = /*contentModal*/ ctx[0].title + "";
    	let t4;
    	let t5;
    	let div3;
    	let p;
    	let t6_value = /*contentModal*/ ctx[0].details + "";
    	let t6;
    	let t7;
    	let div6;
    	let div7_intro;
    	let div9_intro;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			div8 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			span = element("span");
    			span.textContent = "​";
    			t2 = space();
    			div7 = element("div");
    			div5 = element("div");
    			div2 = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t3 = space();
    			div4 = element("div");
    			h3 = element("h3");
    			t4 = text(t4_value);
    			t5 = space();
    			div3 = element("div");
    			p = element("p");
    			t6 = text(t6_value);
    			t7 = space();
    			div6 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "absolute inset-0 bg-gray-500 opacity-75");
    			add_location(div0, file$a, 12, 6, 342);
    			attr_dev(div1, "class", "fixed inset-0 transition-opacity");
    			attr_dev(div1, "aria-hidden", "true");
    			add_location(div1, file$a, 11, 4, 270);
    			attr_dev(span, "class", "hidden sm:inline-block sm:align-middle sm:h-screen");
    			attr_dev(span, "aria-hidden", "true");
    			add_location(span, file$a, 15, 4, 414);
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			attr_dev(path, "stroke-width", "2");
    			attr_dev(path, "d", "M5 13l4 4L19 7");
    			add_location(path, file$a, 41, 12, 1283);
    			attr_dev(svg, "class", "h-6 w-6 text-green-600");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "stroke", "currentColor");
    			attr_dev(svg, "aria-hidden", "true");
    			add_location(svg, file$a, 34, 10, 1054);
    			attr_dev(div2, "class", "mx-auto flex items-center justify-center h-12 w-12 rounded-full\n          bg-green-100");
    			add_location(div2, file$a, 30, 8, 893);
    			attr_dev(h3, "class", "text-lg leading-6 font-medium text-gray-900");
    			attr_dev(h3, "id", "modal-headline");
    			add_location(h3, file$a, 49, 10, 1520);
    			attr_dev(p, "class", "text-sm text-gray-500");
    			add_location(p, file$a, 55, 12, 1711);
    			attr_dev(div3, "class", "mt-2");
    			add_location(div3, file$a, 54, 10, 1680);
    			attr_dev(div4, "class", "mt-3 text-center sm:mt-5");
    			add_location(div4, file$a, 48, 8, 1471);
    			add_location(div5, file$a, 29, 6, 879);
    			attr_dev(div6, "class", "mt-5 sm:mt-6");
    			add_location(div6, file$a, 60, 6, 1823);
    			attr_dev(div7, "class", "inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4\n      text-left overflow-hidden shadow-xl transform transition-all sm:my-8\n      sm:align-middle sm:max-w-sm sm:w-full sm:p-6");
    			attr_dev(div7, "role", "dialog");
    			attr_dev(div7, "aria-modal", "true");
    			attr_dev(div7, "aria-labelledby", "modal-headline");
    			add_location(div7, file$a, 21, 4, 542);
    			attr_dev(div8, "class", "flex items-end justify-center min-h-screen pt-4 px-4 pb-20\n    text-center sm:block sm:p-0");
    			add_location(div8, file$a, 7, 2, 156);
    			attr_dev(div9, "class", "fixed z-10 inset-0 overflow-y-auto");
    			add_location(div9, file$a, 6, 0, 97);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div8);
    			append_dev(div8, div1);
    			append_dev(div1, div0);
    			append_dev(div8, t0);
    			append_dev(div8, span);
    			append_dev(div8, t2);
    			append_dev(div8, div7);
    			append_dev(div7, div5);
    			append_dev(div5, div2);
    			append_dev(div2, svg);
    			append_dev(svg, path);
    			append_dev(div5, t3);
    			append_dev(div5, div4);
    			append_dev(div4, h3);
    			append_dev(h3, t4);
    			append_dev(div4, t5);
    			append_dev(div4, div3);
    			append_dev(div3, p);
    			append_dev(p, t6);
    			append_dev(div7, t7);
    			append_dev(div7, div6);

    			if (default_slot) {
    				default_slot.m(div6, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*contentModal*/ 1) && t4_value !== (t4_value = /*contentModal*/ ctx[0].title + "")) set_data_dev(t4, t4_value);
    			if ((!current || dirty & /*contentModal*/ 1) && t6_value !== (t6_value = /*contentModal*/ ctx[0].details + "")) set_data_dev(t6, t6_value);

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			if (!div7_intro) {
    				add_render_callback(() => {
    					div7_intro = create_in_transition(div7, fly, { y: 200, duration: 500 });
    					div7_intro.start();
    				});
    			}

    			if (!div9_intro) {
    				add_render_callback(() => {
    					div9_intro = create_in_transition(div9, fade, {});
    					div9_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Modal", slots, ['default']);
    	let { contentModal } = $$props;
    	const writable_props = ["contentModal"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("contentModal" in $$props) $$invalidate(0, contentModal = $$props.contentModal);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ fade, fly, contentModal });

    	$$self.$inject_state = $$props => {
    		if ("contentModal" in $$props) $$invalidate(0, contentModal = $$props.contentModal);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [contentModal, $$scope, slots];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { contentModal: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*contentModal*/ ctx[0] === undefined && !("contentModal" in props)) {
    			console.warn("<Modal> was created without expected prop 'contentModal'");
    		}
    	}

    	get contentModal() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set contentModal(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/ScreenHome.svelte generated by Svelte v3.32.1 */
    const file$b = "src/routes/ScreenHome.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	child_ctx[16] = i;
    	return child_ctx;
    }

    // (200:6) {:else}
    function create_else_block_1$1(ctx) {
    	let h1;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Your New Habit";
    			t1 = space();
    			p = element("p");
    			p.textContent = "What will you do? Who will you become? Tap the [Add] button below to\n          create a new habit.";
    			attr_dev(h1, "class", "text-xl font-bold text-gray-500");
    			add_location(h1, file$b, 200, 8, 5782);
    			attr_dev(p, "class", "text-base mt-1 text-gray-500");
    			add_location(p, file$b, 201, 8, 5854);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(200:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (185:6) {#if $userHabitsActive[$indexActiveHabit] && !$isObjectEmpty($userHabitsActive[$indexActiveHabit])}
    function create_if_block_2$1(ctx) {
    	let h1;
    	let t0_value = /*$userHabitsActive*/ ctx[0][/*$indexActiveHabit*/ ctx[4]].detailTitle + "";
    	let t0;
    	let t1;
    	let p;
    	let t2_value = /*$userHabitsActive*/ ctx[0][/*$indexActiveHabit*/ ctx[4]].detailDescription + "";
    	let t2;
    	let t3;
    	let button;
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			button = element("button");
    			i = element("i");
    			attr_dev(h1, "class", "text-xl font-bold");
    			add_location(h1, file$b, 185, 8, 5117);
    			attr_dev(p, "class", "text-base mt-1 text-gray-700");
    			add_location(p, file$b, 188, 8, 5231);
    			attr_dev(i, "class", "fas fa-1x fa-pencil-alt text-blue-900");
    			add_location(i, file$b, 196, 10, 5619);
    			attr_dev(button, "class", "user-icon1 absolute right-0 bottom-0 inline-flex ml-2 bg-white\n          h-6 w-6 justify-center items-center focus:outline-none\n          focus:border-blue-400 focus:border-2 mr-2 mb-2");
    			add_location(button, file$b, 191, 8, 5360);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, button, anchor);
    			append_dev(button, i);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleHabitEdit*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$userHabitsActive, $indexActiveHabit*/ 17 && t0_value !== (t0_value = /*$userHabitsActive*/ ctx[0][/*$indexActiveHabit*/ ctx[4]].detailTitle + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*$userHabitsActive, $indexActiveHabit*/ 17 && t2_value !== (t2_value = /*$userHabitsActive*/ ctx[0][/*$indexActiveHabit*/ ctx[4]].detailDescription + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(185:6) {#if $userHabitsActive[$indexActiveHabit] && !$isObjectEmpty($userHabitsActive[$indexActiveHabit])}",
    		ctx
    	});

    	return block;
    }

    // (216:6) {:else}
    function create_else_block$2(ctx) {
    	let homehabitbuttonnull;
    	let current;

    	homehabitbuttonnull = new HomeHabitButtonNull({
    			props: { i: /*i*/ ctx[16] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(homehabitbuttonnull.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(homehabitbuttonnull, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(homehabitbuttonnull.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(homehabitbuttonnull.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(homehabitbuttonnull, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(216:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (214:6) {#if habit && !$isObjectEmpty(habit)}
    function create_if_block_1$1(ctx) {
    	let homehabitbutton;
    	let current;

    	homehabitbutton = new HomeHabitButton({
    			props: {
    				habit: /*habit*/ ctx[14],
    				i: /*i*/ ctx[16]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(homehabitbutton.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(homehabitbutton, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const homehabitbutton_changes = {};
    			if (dirty & /*$userHabitsActive*/ 1) homehabitbutton_changes.habit = /*habit*/ ctx[14];
    			homehabitbutton.$set(homehabitbutton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(homehabitbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(homehabitbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(homehabitbutton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(214:6) {#if habit && !$isObjectEmpty(habit)}",
    		ctx
    	});

    	return block;
    }

    // (213:4) {#each $userHabitsActive as habit, i}
    function create_each_block(ctx) {
    	let show_if;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$1, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (dirty & /*$userHabitsActive, $isObjectEmpty*/ 5) show_if = !!(/*habit*/ ctx[14] && !/*$isObjectEmpty*/ ctx[2](/*habit*/ ctx[14]));
    		if (show_if) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx, -1);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(213:4) {#each $userHabitsActive as habit, i}",
    		ctx
    	});

    	return block;
    }

    // (223:0) {#if $isNewSocialModal}
    function create_if_block$3(ctx) {
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				contentModal: /*contentModalSocial*/ ctx[7],
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modal_changes = {};

    			if (dirty & /*$$scope*/ 131072) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(223:0) {#if $isNewSocialModal}",
    		ctx
    	});

    	return block;
    }

    // (224:2) <Modal contentModal={contentModalSocial}>
    function create_default_slot$4(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = `${/*contentModalSocial*/ ctx[7].button}`;
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "inline-flex justify-center w-full rounded-md border\n      border-transparent shadow-sm px-4 py-2 bg-blue-900 text-base font-medium\n      text-white hover:bg-blue-500 focus:outline-none focus:ring-2\n      focus:ring-offset-2 focus:ring-blue-700 sm:text-sm");
    			add_location(button, file$b, 224, 4, 6466);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleModalSocialAction*/ ctx[10], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(224:2) <Modal contentModal={contentModalSocial}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let div11;
    	let section0;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let span0;
    	let t3;
    	let span1;
    	let t5;
    	let section1;
    	let h1;
    	let div3;
    	let t6_value = /*$userProfile*/ ctx[3].detailName + "";
    	let t6;
    	let t7;
    	let div4;
    	let t8_value = /*$userProfile*/ ctx[3].detailTitle + "";
    	let t8;
    	let t9;
    	let div7;
    	let div5;
    	let t10;
    	let div6;
    	let span2;
    	let t11_value = /*$userProfile*/ ctx[3].detailInitials + "";
    	let t11;
    	let t12;
    	let div8;
    	let span3;
    	let t14;
    	let div9;
    	let span4;
    	let t15_value = /*$userHabitsHistory*/ ctx[1].length + "";
    	let t15;
    	let t16;
    	let button0;
    	let i0;
    	let t17;
    	let button1;
    	let i1;
    	let t18;
    	let section2;
    	let div10;
    	let show_if;
    	let t19;
    	let section3;
    	let div11_intro;
    	let t20;
    	let if_block1_anchor;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (show_if == null || dirty & /*$userHabitsActive, $indexActiveHabit, $isObjectEmpty*/ 21) show_if = !!(/*$userHabitsActive*/ ctx[0][/*$indexActiveHabit*/ ctx[4]] && !/*$isObjectEmpty*/ ctx[2](/*$userHabitsActive*/ ctx[0][/*$indexActiveHabit*/ ctx[4]]));
    		if (show_if) return create_if_block_2$1;
    		return create_else_block_1$1;
    	}

    	let current_block_type = select_block_type(ctx, -1);
    	let if_block0 = current_block_type(ctx);
    	let each_value = /*$userHabitsActive*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block1 = /*$isNewSocialModal*/ ctx[5] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div11 = element("div");
    			section0 = element("section");
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "Info";
    			t1 = space();
    			div1 = element("div");
    			span0 = element("span");
    			span0.textContent = "info";
    			t3 = space();
    			span1 = element("span");
    			span1.textContent = "info";
    			t5 = space();
    			section1 = element("section");
    			h1 = element("h1");
    			div3 = element("div");
    			t6 = text(t6_value);
    			t7 = space();
    			div4 = element("div");
    			t8 = text(t8_value);
    			t9 = space();
    			div7 = element("div");
    			div5 = element("div");
    			t10 = space();
    			div6 = element("div");
    			span2 = element("span");
    			t11 = text(t11_value);
    			t12 = space();
    			div8 = element("div");
    			span3 = element("span");
    			span3.textContent = `${/*userHabitsActiveClean*/ ctx[6].length}`;
    			t14 = space();
    			div9 = element("div");
    			span4 = element("span");
    			t15 = text(t15_value);
    			t16 = space();
    			button0 = element("button");
    			i0 = element("i");
    			t17 = space();
    			button1 = element("button");
    			i1 = element("i");
    			t18 = space();
    			section2 = element("section");
    			div10 = element("div");
    			if_block0.c();
    			t19 = space();
    			section3 = element("section");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t20 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(div0, "class", "w-1/2 uppercase text-gray-500 font-bold text-xs");
    			add_location(div0, file$b, 120, 6, 2447);
    			add_location(span0, file$b, 123, 8, 2618);
    			attr_dev(span1, "class", "ml-2");
    			add_location(span1, file$b, 124, 8, 2644);
    			attr_dev(div1, "class", "flex justify-between uppercase text-gray-500 font-bold text-xs");
    			add_location(div1, file$b, 121, 6, 2525);
    			attr_dev(div2, "class", "opacity-0 px-4 flex items-center justify-between");
    			add_location(div2, file$b, 119, 4, 2378);
    			attr_dev(section0, "class", "home-score pt-3");
    			add_location(section0, file$b, 118, 2, 2340);
    			attr_dev(div3, "class", "text-lg font-bold leading-tight");
    			add_location(div3, file$b, 131, 6, 2806);
    			attr_dev(div4, "class", "text-sm font-extrabold leading-tight text-blue-900");
    			add_location(div4, file$b, 134, 6, 2905);
    			attr_dev(h1, "class", "user-title text-center  svelte-lab9ei");
    			add_location(h1, file$b, 130, 4, 2763);
    			attr_dev(div5, "class", "absolute inset-0 bg-blue-100 rounded-full");
    			add_location(div5, file$b, 139, 6, 3070);
    			add_location(span2, file$b, 148, 8, 3457);
    			attr_dev(div6, "style", "font-family: 'Bungee', cursive; width: 168px; height 168px;");
    			attr_dev(div6, "class", "relative rounded-full m-1 z-0 text-9xl flex justify-center\n        items-center h-full");
    			add_location(div6, file$b, 144, 6, 3264);
    			attr_dev(div7, "class", "user-img relative svelte-lab9ei");
    			add_location(div7, file$b, 138, 4, 3032);
    			add_location(span3, file$b, 154, 6, 3696);
    			attr_dev(div8, "class", "user-stat1 bg-white text-lg border-1 h-10 w-10 flex justify-center\n      items-center rounded-full border-blue-100 font-extrabold shadow ml-5 svelte-lab9ei");
    			add_location(div8, file$b, 151, 4, 3528);
    			add_location(span4, file$b, 159, 6, 3923);
    			attr_dev(div9, "class", "user-stat2 bg-white text-lg border-1 h-10 w-10 flex justify-center\n      items-center rounded-full border-blue-100 font-extrabold shadow mr-5 svelte-lab9ei");
    			add_location(div9, file$b, 156, 4, 3755);
    			attr_dev(i0, "class", " fas fa-1x fa-history text-blue-900");
    			add_location(i0, file$b, 167, 6, 4291);
    			attr_dev(button0, "class", "user-icon1 bg-white h-14 w-14 flex justify-center items-center\n      rounded-full border-2 border-blue-100 shadow hover:bg-blue-200\n      focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 focus:outline-none\n      transition-colors duration-75 svelte-lab9ei");
    			add_location(button0, file$b, 161, 4, 3979);
    			attr_dev(i1, "class", " fas fa-1x fa-share-alt text-blue-900");
    			add_location(i1, file$b, 176, 6, 4736);
    			attr_dev(button1, "class", "user-icon2 bg-white h-14 w-14 flex justify-center items-center\n      rounded-full border-2 border-blue-100 shadow hover:bg-blue-200\n      focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 focus:outline-none\n      transition-colors duration-75 svelte-lab9ei");
    			add_location(button1, file$b, 170, 4, 4425);
    			attr_dev(section1, "class", "home-user home-user2 pt-6 svelte-lab9ei");
    			add_location(section1, file$b, 129, 2, 2715);
    			attr_dev(div10, "class", "relative bg-white h-full py-2 px-2 shadow rounded sm:rounded-lg\n      sm:px-10 text-left");
    			add_location(div10, file$b, 181, 4, 4894);
    			attr_dev(section2, "class", "home-habit-info pt-6 sm:mx-auto sm:w-full sm:max-w-md svelte-lab9ei");
    			add_location(section2, file$b, 180, 2, 4818);
    			attr_dev(section3, "class", "home-habit-select pt-3 grid grid-cols-3 grid-rows-1 gap-3 sm:mx-auto\n    sm:w-full sm:max-w-md");
    			add_location(section3, file$b, 209, 2, 6056);
    			attr_dev(div11, "class", "home-grid pb-2 overflow-y-scroll px-5 svelte-lab9ei");
    			add_location(div11, file$b, 116, 0, 2277);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div11, anchor);
    			append_dev(div11, section0);
    			append_dev(section0, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, span0);
    			append_dev(div1, t3);
    			append_dev(div1, span1);
    			append_dev(div11, t5);
    			append_dev(div11, section1);
    			append_dev(section1, h1);
    			append_dev(h1, div3);
    			append_dev(div3, t6);
    			append_dev(h1, t7);
    			append_dev(h1, div4);
    			append_dev(div4, t8);
    			append_dev(section1, t9);
    			append_dev(section1, div7);
    			append_dev(div7, div5);
    			append_dev(div7, t10);
    			append_dev(div7, div6);
    			append_dev(div6, span2);
    			append_dev(span2, t11);
    			append_dev(section1, t12);
    			append_dev(section1, div8);
    			append_dev(div8, span3);
    			append_dev(section1, t14);
    			append_dev(section1, div9);
    			append_dev(div9, span4);
    			append_dev(span4, t15);
    			append_dev(section1, t16);
    			append_dev(section1, button0);
    			append_dev(button0, i0);
    			append_dev(section1, t17);
    			append_dev(section1, button1);
    			append_dev(button1, i1);
    			append_dev(div11, t18);
    			append_dev(div11, section2);
    			append_dev(section2, div10);
    			if_block0.m(div10, null);
    			append_dev(div11, t19);
    			append_dev(div11, section3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section3, null);
    			}

    			insert_dev(target, t20, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*handleButtonHistory*/ ctx[8], false, false, false),
    					listen_dev(button1, "click", /*handleButtonSocial*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*$userProfile*/ 8) && t6_value !== (t6_value = /*$userProfile*/ ctx[3].detailName + "")) set_data_dev(t6, t6_value);
    			if ((!current || dirty & /*$userProfile*/ 8) && t8_value !== (t8_value = /*$userProfile*/ ctx[3].detailTitle + "")) set_data_dev(t8, t8_value);
    			if ((!current || dirty & /*$userProfile*/ 8) && t11_value !== (t11_value = /*$userProfile*/ ctx[3].detailInitials + "")) set_data_dev(t11, t11_value);
    			if ((!current || dirty & /*$userHabitsHistory*/ 2) && t15_value !== (t15_value = /*$userHabitsHistory*/ ctx[1].length + "")) set_data_dev(t15, t15_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx, dirty)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div10, null);
    				}
    			}

    			if (dirty & /*$userHabitsActive, $isObjectEmpty*/ 5) {
    				each_value = /*$userHabitsActive*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(section3, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*$isNewSocialModal*/ ctx[5]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*$isNewSocialModal*/ 32) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			if (!div11_intro) {
    				add_render_callback(() => {
    					div11_intro = create_in_transition(div11, fade, {});
    					div11_intro.start();
    				});
    			}

    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div11);
    			if_block0.d();
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t20);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $userHabitsActive;
    	let $isObjectEmpty;
    	let $userHabitsHistory;
    	let $userProfile;
    	let $indexActiveHabit;
    	let $isNewSocialModal;
    	validate_store(userHabitsActive, "userHabitsActive");
    	component_subscribe($$self, userHabitsActive, $$value => $$invalidate(0, $userHabitsActive = $$value));
    	validate_store(isObjectEmpty, "isObjectEmpty");
    	component_subscribe($$self, isObjectEmpty, $$value => $$invalidate(2, $isObjectEmpty = $$value));
    	validate_store(userHabitsHistory, "userHabitsHistory");
    	component_subscribe($$self, userHabitsHistory, $$value => $$invalidate(1, $userHabitsHistory = $$value));
    	validate_store(userProfile, "userProfile");
    	component_subscribe($$self, userProfile, $$value => $$invalidate(3, $userProfile = $$value));
    	validate_store(indexActiveHabit, "indexActiveHabit");
    	component_subscribe($$self, indexActiveHabit, $$value => $$invalidate(4, $indexActiveHabit = $$value));
    	validate_store(isNewSocialModal, "isNewSocialModal");
    	component_subscribe($$self, isNewSocialModal, $$value => $$invalidate(5, $isNewSocialModal = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ScreenHome", slots, []);
    	let selected;

    	let userHabitsActiveClean = $userHabitsActive.filter(habit => {
    		if (!$isObjectEmpty(habit)) {
    			return habit;
    		}
    	});

    	const contentModalSocial = {
    		title: "Social Share Unavailable",
    		details: "This feature will be enabled shortly, check back again.",
    		button: "Go back to App"
    	};

    	const contentModalHabitIsComplete = {
    		title: "Congratulations!",
    		details: "Complete this reflection to track your progress",
    		button: "Complete Habit"
    	};

    	const handleButtonHistory = () => {
    		push("/history");
    	};

    	const handleHabitEdit = () => {
    		push("/edit");
    	};

    	const handleModalSocialAction = () => {
    		isNewSocialModal.set(false);
    	};

    	const handleButtonSocial = () => {
    		isNewSocialModal.set(true);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ScreenHome> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		indexActiveHabit,
    		isNewSocialModal,
    		userProfile,
    		userHabitsActive,
    		userHabitsHistory,
    		API_ENDPOINT,
    		isObjectEmpty,
    		fade,
    		push,
    		AppHeader,
    		ContentWrapper,
    		HomeHabitButton,
    		HomeHabitButtonNull,
    		Modal,
    		selected,
    		userHabitsActiveClean,
    		contentModalSocial,
    		contentModalHabitIsComplete,
    		handleButtonHistory,
    		handleHabitEdit,
    		handleModalSocialAction,
    		handleButtonSocial,
    		$userHabitsActive,
    		$isObjectEmpty,
    		$userHabitsHistory,
    		$userProfile,
    		$indexActiveHabit,
    		$isNewSocialModal
    	});

    	$$self.$inject_state = $$props => {
    		if ("selected" in $$props) selected = $$props.selected;
    		if ("userHabitsActiveClean" in $$props) $$invalidate(6, userHabitsActiveClean = $$props.userHabitsActiveClean);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$userHabitsActive*/ 1) ;

    		if ($$self.$$.dirty & /*$userHabitsHistory*/ 2) ;
    	};

    	return [
    		$userHabitsActive,
    		$userHabitsHistory,
    		$isObjectEmpty,
    		$userProfile,
    		$indexActiveHabit,
    		$isNewSocialModal,
    		userHabitsActiveClean,
    		contentModalSocial,
    		handleButtonHistory,
    		handleHabitEdit,
    		handleModalSocialAction,
    		handleButtonSocial
    	];
    }

    class ScreenHome extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScreenHome",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/components/AddEditDeleteHabit.svelte generated by Svelte v3.32.1 */
    const file$c = "src/components/AddEditDeleteHabit.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	child_ctx[20] = list;
    	child_ctx[21] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	return child_ctx;
    }

    // (63:12) {:else}
    function create_else_block_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("1 hour");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2$1.name,
    		type: "else",
    		source: "(63:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (61:65) 
    function create_if_block_3$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("24 hours");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(61:65) ",
    		ctx
    	});

    	return block;
    }

    // (59:12) {#if tempLocalUserHabit.detailDuration > 86400}
    function create_if_block_2$2(ctx) {
    	let t0_value = /*tempLocalUserHabit*/ ctx[0].detailDuration / 86400 + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = text(" days");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tempLocalUserHabit*/ 1 && t0_value !== (t0_value = /*tempLocalUserHabit*/ ctx[0].detailDuration / 86400 + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(59:12) {#if tempLocalUserHabit.detailDuration > 86400}",
    		ctx
    	});

    	return block;
    }

    // (81:12) {:else}
    function create_else_block_1$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("+");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$2.name,
    		type: "else",
    		source: "(81:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (79:12) {#if tempLocalUserHabit.detailCode}
    function create_if_block_1$2(ctx) {
    	let t_value = /*tempLocalUserHabit*/ ctx[0].detailCode + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tempLocalUserHabit*/ 1 && t_value !== (t_value = /*tempLocalUserHabit*/ ctx[0].detailCode + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(79:12) {#if tempLocalUserHabit.detailCode}",
    		ctx
    	});

    	return block;
    }

    // (144:10) {#each $contentHabitDuration as option}
    function create_each_block_1(ctx) {
    	let option;
    	let t0_value = /*option*/ ctx[22].text + "";
    	let t0;
    	let t1;
    	let option_disabled_value;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.disabled = option_disabled_value = /*option*/ ctx[22].disabled;
    			option.__value = option_value_value = /*option*/ ctx[22];
    			option.value = option.__value;
    			add_location(option, file$c, 144, 12, 4996);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$contentHabitDuration*/ 32 && t0_value !== (t0_value = /*option*/ ctx[22].text + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*$contentHabitDuration*/ 32 && option_disabled_value !== (option_disabled_value = /*option*/ ctx[22].disabled)) {
    				prop_dev(option, "disabled", option_disabled_value);
    			}

    			if (dirty & /*$contentHabitDuration*/ 32 && option_value_value !== (option_value_value = /*option*/ ctx[22])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(144:10) {#each $contentHabitDuration as option}",
    		ctx
    	});

    	return block;
    }

    // (210:12) {:else}
    function create_else_block$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Kick an old habit");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(210:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (208:12) {#if tempLocalUserHabit.detailIsNewHabit}
    function create_if_block$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Start a new habit");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(208:12) {#if tempLocalUserHabit.detailIsNewHabit}",
    		ctx
    	});

    	return block;
    }

    // (226:12) {#each $contentHabitDetailCategory as category, i}
    function create_each_block$1(ctx) {
    	let div2;
    	let div0;
    	let input;
    	let input_id_value;
    	let input_name_value;
    	let t0;
    	let div1;
    	let label;
    	let t1_value = /*category*/ ctx[19].title + "";
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*category*/ ctx[19].content + "";
    	let t3;
    	let t4;
    	let mounted;
    	let dispose;

    	function input_change_handler() {
    		/*input_change_handler*/ ctx[16].call(input, /*i*/ ctx[21]);
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			input = element("input");
    			t0 = space();
    			div1 = element("div");
    			label = element("label");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			attr_dev(input, "id", input_id_value = /*category*/ ctx[19].label);
    			attr_dev(input, "name", input_name_value = /*category*/ ctx[19].label);
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "class", "focus:ring-blue-900 h-4 w-4 text-blue-900\n                    border-gray-300 rounded");
    			add_location(input, file$c, 228, 18, 8172);
    			attr_dev(div0, "class", "flex items-center h-5");
    			add_location(div0, file$c, 227, 16, 8118);
    			attr_dev(label, "for", "comments");
    			attr_dev(label, "class", "font-medium text-gray-900");
    			add_location(label, file$c, 237, 18, 8589);
    			attr_dev(p, "class", "font-base text-gray-500");
    			add_location(p, file$c, 240, 18, 8728);
    			attr_dev(div1, "class", "ml-3 text-sm");
    			add_location(div1, file$c, 236, 16, 8544);
    			attr_dev(div2, "class", "relative flex items-start");
    			add_location(div2, file$c, 226, 14, 8062);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, input);
    			input.checked = /*tempLocalUserHabit*/ ctx[0].detailCategory[`isCategory${/*i*/ ctx[21] + 1}`];
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, label);
    			append_dev(label, t1);
    			append_dev(div1, t2);
    			append_dev(div1, p);
    			append_dev(p, t3);
    			append_dev(div2, t4);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", input_change_handler);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*$contentHabitDetailCategory*/ 64 && input_id_value !== (input_id_value = /*category*/ ctx[19].label)) {
    				attr_dev(input, "id", input_id_value);
    			}

    			if (dirty & /*$contentHabitDetailCategory*/ 64 && input_name_value !== (input_name_value = /*category*/ ctx[19].label)) {
    				attr_dev(input, "name", input_name_value);
    			}

    			if (dirty & /*tempLocalUserHabit*/ 1) {
    				input.checked = /*tempLocalUserHabit*/ ctx[0].detailCategory[`isCategory${/*i*/ ctx[21] + 1}`];
    			}

    			if (dirty & /*$contentHabitDetailCategory*/ 64 && t1_value !== (t1_value = /*category*/ ctx[19].title + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*$contentHabitDetailCategory*/ 64 && t3_value !== (t3_value = /*category*/ ctx[19].content + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(226:12) {#each $contentHabitDetailCategory as category, i}",
    		ctx
    	});

    	return block;
    }

    // (48:0) <ContentWrapper>
    function create_default_slot$5(ctx) {
    	let div24;
    	let form;
    	let div4;
    	let div3;
    	let div0;
    	let t0;
    	let span0;
    	let t1;
    	let span1;
    	let t3;
    	let div1;
    	let t4;
    	let span2;
    	let t5;
    	let span3;
    	let t7;
    	let div2;
    	let t8;
    	let span4;
    	let t9;
    	let span5;
    	let t11;
    	let div6;
    	let label0;
    	let t13;
    	let div5;
    	let input0;
    	let t14;
    	let div7;
    	let label1;
    	let t16;
    	let select;
    	let t17;
    	let div9;
    	let label2;
    	let t19;
    	let div8;
    	let textarea;
    	let t20;
    	let div11;
    	let label3;
    	let t22;
    	let div10;
    	let input1;
    	let t23;
    	let div12;
    	let button0;
    	let span6;
    	let t25;
    	let span7;
    	let t26;
    	let span9;
    	let span8;
    	let t27;
    	let div14;
    	let fieldset;
    	let legend;
    	let t28;
    	let span10;
    	let t30;
    	let t31;
    	let div13;
    	let t32;
    	let div15;
    	let button1;
    	let t33;
    	let t34;
    	let div23;
    	let div19;
    	let div17;
    	let div16;
    	let t35;
    	let div18;
    	let span11;
    	let t37;
    	let div22;
    	let div20;
    	let button2;
    	let span12;
    	let t39;
    	let div21;
    	let button3;
    	let span13;
    	let t40;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*tempLocalUserHabit*/ ctx[0].detailDuration > 86400) return create_if_block_2$2;
    		if (/*tempLocalUserHabit*/ ctx[0].detailDuration == 86400) return create_if_block_3$1;
    		return create_else_block_2$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*tempLocalUserHabit*/ ctx[0].detailCode) return create_if_block_1$2;
    		return create_else_block_1$2;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);
    	let each_value_1 = /*$contentHabitDuration*/ ctx[5];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	function select_block_type_2(ctx, dirty) {
    		if (/*tempLocalUserHabit*/ ctx[0].detailIsNewHabit) return create_if_block$4;
    		return create_else_block$3;
    	}

    	let current_block_type_2 = select_block_type_2(ctx);
    	let if_block2 = current_block_type_2(ctx);
    	let each_value = /*$contentHabitDetailCategory*/ ctx[6];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div24 = element("div");
    			form = element("form");
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			if_block0.c();
    			t0 = space();
    			span0 = element("span");
    			t1 = space();
    			span1 = element("span");
    			span1.textContent = "Habit Duration";
    			t3 = space();
    			div1 = element("div");
    			if_block1.c();
    			t4 = space();
    			span2 = element("span");
    			t5 = space();
    			span3 = element("span");
    			span3.textContent = "Habit Code";
    			t7 = space();
    			div2 = element("div");
    			t8 = text("info\n            ");
    			span4 = element("span");
    			t9 = space();
    			span5 = element("span");
    			span5.textContent = "Elapsed Time";
    			t11 = space();
    			div6 = element("div");
    			label0 = element("label");
    			label0.textContent = "Habit Title";
    			t13 = space();
    			div5 = element("div");
    			input0 = element("input");
    			t14 = space();
    			div7 = element("div");
    			label1 = element("label");
    			label1.textContent = "Duration";
    			t16 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t17 = space();
    			div9 = element("div");
    			label2 = element("label");
    			label2.textContent = "Habit Description";
    			t19 = space();
    			div8 = element("div");
    			textarea = element("textarea");
    			t20 = space();
    			div11 = element("div");
    			label3 = element("label");
    			label3.textContent = "Habit Code";
    			t22 = space();
    			div10 = element("div");
    			input1 = element("input");
    			t23 = space();
    			div12 = element("div");
    			button0 = element("button");
    			span6 = element("span");
    			span6.textContent = "Use setting";
    			t25 = space();
    			span7 = element("span");
    			t26 = space();
    			span9 = element("span");
    			span8 = element("span");
    			if_block2.c();
    			t27 = space();
    			div14 = element("div");
    			fieldset = element("fieldset");
    			legend = element("legend");
    			t28 = text("Habit category\n            ");
    			span10 = element("span");
    			span10.textContent = "(check any that apply)";
    			t30 = text("\n            :");
    			t31 = space();
    			div13 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t32 = space();
    			div15 = element("div");
    			button1 = element("button");
    			t33 = text(/*actionTitle*/ ctx[1]);
    			t34 = space();
    			div23 = element("div");
    			div19 = element("div");
    			div17 = element("div");
    			div16 = element("div");
    			t35 = space();
    			div18 = element("div");
    			span11 = element("span");
    			span11.textContent = "Or";
    			t37 = space();
    			div22 = element("div");
    			div20 = element("div");
    			button2 = element("button");
    			span12 = element("span");
    			span12.textContent = "Back";
    			t39 = space();
    			div21 = element("div");
    			button3 = element("button");
    			span13 = element("span");
    			t40 = text(/*altActionTitle*/ ctx[2]);
    			set_style(span0, "height", "50%");
    			set_style(span0, "top", "50%");
    			set_style(span0, "width", "28vw");
    			set_style(span0, "left", "calc(100% +\n              .5rem)");
    			attr_dev(span0, "class", "absolute text-blue-900 border-t-2 green-500");
    			add_location(span0, file$c, 63, 12, 1964);
    			set_style(span1, "left", "calc(100% + 28vw)");
    			attr_dev(span1, "class", "ml-2 p-2 rounded flex justify-center items-center absolute\n              top-0 bottom-0 leading-none text-xs font-extrabold text-gray-900\n              uppercase text-left");
    			add_location(span1, file$c, 67, 12, 2148);
    			attr_dev(div0, "class", "relative uppercase font-extrabold text-gray-900 text-xs\n            text-left");
    			add_location(div0, file$c, 55, 10, 1605);
    			set_style(span2, "height", "50%");
    			set_style(span2, "top", "50%");
    			set_style(span2, "width", "23vw");
    			set_style(span2, "left", "calc(100% +\n              .5rem)");
    			attr_dev(span2, "class", "absolute text-blue-900 border-t-2 green-500");
    			add_location(span2, file$c, 81, 12, 2705);
    			set_style(span3, "left", "calc(100% + 23vw)");
    			attr_dev(span3, "class", "ml-2 p-2 rounded flex justify-center items-center absolute\n              top-0 bottom-0 leading-none text-xs font-extrabold text-gray-900\n              uppercase text-left");
    			add_location(span3, file$c, 85, 12, 2889);
    			attr_dev(div1, "class", "relative mt-1 text-6xl font-extrabold text-center\n            text-blue-900");
    			add_location(div1, file$c, 75, 10, 2471);
    			set_style(span4, "height", "50%");
    			set_style(span4, "top", "50%");
    			set_style(span4, "width", "28vw");
    			set_style(span4, "left", "calc(100% +\n              .5rem)");
    			attr_dev(span4, "class", "absolute text-blue-900 border-t-2 green-500");
    			add_location(span4, file$c, 98, 12, 3345);
    			set_style(span5, "left", "calc(100% + 28vw)");
    			attr_dev(span5, "class", "ml-2 p-2 rounded flex justify-center items-center absolute\n              top-0 bottom-0 leading-none text-xs font-extrabold text-gray-900\n              uppercase text-left");
    			add_location(span5, file$c, 102, 12, 3529);
    			attr_dev(div2, "class", "relative mt-2 text-sm font-bold text-center text-gray-900\n            uppercase");
    			add_location(div2, file$c, 94, 10, 3210);
    			attr_dev(div3, "class", "flex flex-col mx-auto");
    			add_location(div3, file$c, 54, 8, 1559);
    			attr_dev(div4, "class", "w-1/3 bg-white py-1 px-2 border-2 border-blue-100 shadow\n        rounded-sm focus:outline-none");
    			add_location(div4, file$c, 51, 6, 1434);
    			attr_dev(label0, "for", "habit-title");
    			attr_dev(label0, "class", "block text-sm font-medium text-gray-900");
    			add_location(label0, file$c, 114, 8, 3890);
    			attr_dev(input0, "id", "habit-title");
    			attr_dev(input0, "name", "habit-title");
    			input0.required = true;
    			attr_dev(input0, "class", "appearance-none block w-full px-3 py-2 border border-gray-300\n            rounded-md shadow-sm placeholder-gray-400 focus:outline-none\n            focus:ring-blue-900 focus:border-blue-900 sm:text-sm");
    			add_location(input0, file$c, 120, 10, 4060);
    			attr_dev(div5, "class", "mt-1");
    			add_location(div5, file$c, 119, 8, 4031);
    			add_location(div6, file$c, 113, 6, 3876);
    			attr_dev(label1, "for", "location");
    			attr_dev(label1, "class", "block text-sm font-medium text-gray-900");
    			add_location(label1, file$c, 132, 8, 4476);
    			attr_dev(select, "id", "habit-duration");
    			attr_dev(select, "name", "habit-duration");
    			attr_dev(select, "class", "mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300\n          focus:outline-none focus:ring-blue-900 focus:border-blue-900\n          sm:text-sm rounded-md");
    			if (/*selected*/ ctx[4] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[12].call(select));
    			add_location(select, file$c, 135, 8, 4591);
    			add_location(div7, file$c, 131, 6, 4462);
    			attr_dev(label2, "for", "habit-desc");
    			attr_dev(label2, "class", "block text-sm font-medium text-gray-900");
    			add_location(label2, file$c, 152, 8, 5167);
    			attr_dev(textarea, "id", "habit-desc");
    			attr_dev(textarea, "name", "habit-desc");
    			textarea.required = true;
    			attr_dev(textarea, "rows", "3");
    			attr_dev(textarea, "class", "appearance-none block w-full px-3 py-2 border border-gray-300\n            rounded-md shadow-sm placeholder-gray-400 focus:outline-none\n            focus:ring-blue-900 focus:border-blue-900 sm:text-sm");
    			add_location(textarea, file$c, 156, 10, 5322);
    			attr_dev(div8, "class", "mt-1");
    			add_location(div8, file$c, 155, 8, 5293);
    			add_location(div9, file$c, 151, 6, 5153);
    			attr_dev(label3, "for", "habit-code");
    			attr_dev(label3, "class", "block text-sm font-medium text-gray-900");
    			add_location(label3, file$c, 169, 8, 5766);
    			attr_dev(input1, "id", "habit-code");
    			attr_dev(input1, "name", "habit-code");
    			input1.required = true;
    			attr_dev(input1, "maxlength", "2");
    			attr_dev(input1, "class", "appearance-none block w-full px-3 py-2 border border-gray-300\n            rounded-md shadow-sm placeholder-gray-400 focus:outline-none\n            focus:ring-blue-900 focus:border-blue-900 sm:text-sm");
    			add_location(input1, file$c, 173, 10, 5914);
    			attr_dev(div10, "class", "mt-1");
    			add_location(div10, file$c, 172, 8, 5885);
    			add_location(div11, file$c, 168, 6, 5752);
    			attr_dev(span6, "class", "sr-only");
    			add_location(span6, file$c, 197, 10, 6928);
    			attr_dev(span7, "aria-hidden", "true");
    			attr_dev(span7, "class", "translate-x-5 inline-block h-5 w-5 rounded-full bg-white\n            shadow transform ring-0 transition ease-in-out duration-200");
    			toggle_class(span7, "translate-x-5", /*tempLocalUserHabit*/ ctx[0].detailIsNewHabit);
    			add_location(span7, file$c, 199, 10, 7040);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "aria-pressed", "false");
    			attr_dev(button0, "aria-labelledby", "toggleLabel");
    			attr_dev(button0, "class", "bg-gray-200 relative inline-flex flex-shrink-0 h-6 w-11\n          border-2 border-transparent rounded-full cursor-pointer\n          transition-colors ease-in-out duration-200 focus:outline-none\n          focus:ring-2 focus:ring-offset-2 focus:ring-blue-900");
    			toggle_class(button0, "bg-blue-900", /*tempLocalUserHabit*/ ctx[0].detailIsNewHabit);
    			add_location(button0, file$c, 187, 8, 6434);
    			attr_dev(span8, "class", "text-sm font-medium text-gray-900");
    			add_location(span8, file$c, 206, 10, 7372);
    			attr_dev(span9, "class", "ml-3");
    			attr_dev(span9, "id", "toggleLabel");
    			add_location(span9, file$c, 205, 8, 7325);
    			attr_dev(div12, "class", "flex items-center");
    			add_location(div12, file$c, 185, 6, 6339);
    			attr_dev(span10, "class", "text-sm text-gray-900");
    			add_location(span10, file$c, 220, 12, 7845);
    			attr_dev(legend, "class", "block text-sm font-medium text-gray-900");
    			add_location(legend, file$c, 218, 10, 7749);
    			attr_dev(div13, "class", "mt-4 space-y-4");
    			add_location(div13, file$c, 223, 10, 7955);
    			add_location(fieldset, file$c, 217, 8, 7728);
    			attr_dev(div14, "class", "mt-6");
    			add_location(div14, file$c, 216, 6, 7701);
    			attr_dev(button1, "type", "submit");
    			attr_dev(button1, "class", "w-full flex justify-center py-2 px-4 border border-transparent\n          rounded-md shadow-sm text-sm font-bold text-white bg-blue-900\n          hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2\n          focus:ring-blue-900");
    			add_location(button1, file$c, 250, 8, 8935);
    			attr_dev(div15, "class", "mt-6");
    			add_location(div15, file$c, 249, 6, 8908);
    			attr_dev(form, "class", "space-y-6");
    			add_location(form, file$c, 49, 4, 1357);
    			attr_dev(div16, "class", "w-full border-t border-gray-300");
    			add_location(div16, file$c, 264, 10, 9418);
    			attr_dev(div17, "class", "absolute inset-0 flex items-center");
    			add_location(div17, file$c, 263, 8, 9359);
    			attr_dev(span11, "class", "px-2 bg-white text-gray-900");
    			add_location(span11, file$c, 267, 10, 9550);
    			attr_dev(div18, "class", "relative flex justify-center text-sm");
    			add_location(div18, file$c, 266, 8, 9489);
    			attr_dev(div19, "class", "relative");
    			add_location(div19, file$c, 262, 6, 9328);
    			attr_dev(span12, "class", "");
    			add_location(span12, file$c, 278, 12, 9955);
    			attr_dev(button2, "class", "w-full inline-flex justify-center py-2 px-4 border\n            border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium\n            text-gray-900 hover:bg-gray-50");
    			add_location(button2, file$c, 273, 10, 9703);
    			add_location(div20, file$c, 272, 8, 9687);
    			attr_dev(span13, "class", "");
    			add_location(span13, file$c, 287, 12, 10293);
    			attr_dev(button3, "class", "w-full inline-flex justify-center py-2 px-4 border\n            border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium\n            text-gray-900 hover:bg-gray-50");
    			add_location(button3, file$c, 282, 10, 10041);
    			add_location(div21, file$c, 281, 8, 10025);
    			attr_dev(div22, "class", "mt-6 grid grid-cols-2 gap-3");
    			add_location(div22, file$c, 271, 6, 9637);
    			attr_dev(div23, "class", "mt-6");
    			add_location(div23, file$c, 261, 4, 9303);
    			add_location(div24, file$c, 48, 2, 1347);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div24, anchor);
    			append_dev(div24, form);
    			append_dev(form, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			if_block0.m(div0, null);
    			append_dev(div0, t0);
    			append_dev(div0, span0);
    			append_dev(div0, t1);
    			append_dev(div0, span1);
    			append_dev(div3, t3);
    			append_dev(div3, div1);
    			if_block1.m(div1, null);
    			append_dev(div1, t4);
    			append_dev(div1, span2);
    			append_dev(div1, t5);
    			append_dev(div1, span3);
    			append_dev(div3, t7);
    			append_dev(div3, div2);
    			append_dev(div2, t8);
    			append_dev(div2, span4);
    			append_dev(div2, t9);
    			append_dev(div2, span5);
    			append_dev(form, t11);
    			append_dev(form, div6);
    			append_dev(div6, label0);
    			append_dev(div6, t13);
    			append_dev(div6, div5);
    			append_dev(div5, input0);
    			set_input_value(input0, /*tempLocalUserHabit*/ ctx[0].detailTitle);
    			append_dev(form, t14);
    			append_dev(form, div7);
    			append_dev(div7, label1);
    			append_dev(div7, t16);
    			append_dev(div7, select);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select, null);
    			}

    			select_option(select, /*selected*/ ctx[4]);
    			append_dev(form, t17);
    			append_dev(form, div9);
    			append_dev(div9, label2);
    			append_dev(div9, t19);
    			append_dev(div9, div8);
    			append_dev(div8, textarea);
    			set_input_value(textarea, /*tempLocalUserHabit*/ ctx[0].detailDescription);
    			append_dev(form, t20);
    			append_dev(form, div11);
    			append_dev(div11, label3);
    			append_dev(div11, t22);
    			append_dev(div11, div10);
    			append_dev(div10, input1);
    			set_input_value(input1, /*tempLocalUserHabit*/ ctx[0].detailCode);
    			append_dev(form, t23);
    			append_dev(form, div12);
    			append_dev(div12, button0);
    			append_dev(button0, span6);
    			append_dev(button0, t25);
    			append_dev(button0, span7);
    			append_dev(div12, t26);
    			append_dev(div12, span9);
    			append_dev(span9, span8);
    			if_block2.m(span8, null);
    			append_dev(form, t27);
    			append_dev(form, div14);
    			append_dev(div14, fieldset);
    			append_dev(fieldset, legend);
    			append_dev(legend, t28);
    			append_dev(legend, span10);
    			append_dev(legend, t30);
    			append_dev(fieldset, t31);
    			append_dev(fieldset, div13);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div13, null);
    			}

    			append_dev(form, t32);
    			append_dev(form, div15);
    			append_dev(div15, button1);
    			append_dev(button1, t33);
    			append_dev(div24, t34);
    			append_dev(div24, div23);
    			append_dev(div23, div19);
    			append_dev(div19, div17);
    			append_dev(div17, div16);
    			append_dev(div19, t35);
    			append_dev(div19, div18);
    			append_dev(div18, span11);
    			append_dev(div23, t37);
    			append_dev(div23, div22);
    			append_dev(div22, div20);
    			append_dev(div20, button2);
    			append_dev(button2, span12);
    			append_dev(div22, t39);
    			append_dev(div22, div21);
    			append_dev(div21, button3);
    			append_dev(button3, span13);
    			append_dev(span13, t40);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[11]),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[12]),
    					listen_dev(select, "change", /*change_handler*/ ctx[13], false, false, false),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[14]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[15]),
    					listen_dev(button0, "click", /*handleToggleHabit*/ ctx[9], false, false, false),
    					listen_dev(form, "submit", prevent_default(/*handleLocalSubmit*/ ctx[7]), false, true, false),
    					listen_dev(button2, "click", /*click_handler*/ ctx[17], false, false, false),
    					listen_dev(
    						button3,
    						"click",
    						function () {
    							if (is_function(/*handleAltAction*/ ctx[3])) /*handleAltAction*/ ctx[3].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div0, t0);
    				}
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div1, t4);
    				}
    			}

    			if (dirty & /*tempLocalUserHabit*/ 1 && input0.value !== /*tempLocalUserHabit*/ ctx[0].detailTitle) {
    				set_input_value(input0, /*tempLocalUserHabit*/ ctx[0].detailTitle);
    			}

    			if (dirty & /*$contentHabitDuration*/ 32) {
    				each_value_1 = /*$contentHabitDuration*/ ctx[5];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*selected, $contentHabitDuration*/ 48) {
    				select_option(select, /*selected*/ ctx[4]);
    			}

    			if (dirty & /*tempLocalUserHabit*/ 1) {
    				set_input_value(textarea, /*tempLocalUserHabit*/ ctx[0].detailDescription);
    			}

    			if (dirty & /*tempLocalUserHabit*/ 1 && input1.value !== /*tempLocalUserHabit*/ ctx[0].detailCode) {
    				set_input_value(input1, /*tempLocalUserHabit*/ ctx[0].detailCode);
    			}

    			if (dirty & /*tempLocalUserHabit*/ 1) {
    				toggle_class(span7, "translate-x-5", /*tempLocalUserHabit*/ ctx[0].detailIsNewHabit);
    			}

    			if (dirty & /*tempLocalUserHabit*/ 1) {
    				toggle_class(button0, "bg-blue-900", /*tempLocalUserHabit*/ ctx[0].detailIsNewHabit);
    			}

    			if (current_block_type_2 !== (current_block_type_2 = select_block_type_2(ctx))) {
    				if_block2.d(1);
    				if_block2 = current_block_type_2(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(span8, null);
    				}
    			}

    			if (dirty & /*$contentHabitDetailCategory, tempLocalUserHabit*/ 65) {
    				each_value = /*$contentHabitDetailCategory*/ ctx[6];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div13, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*actionTitle*/ 2) set_data_dev(t33, /*actionTitle*/ ctx[1]);
    			if (dirty & /*altActionTitle*/ 4) set_data_dev(t40, /*altActionTitle*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div24);
    			if_block0.d();
    			if_block1.d();
    			destroy_each(each_blocks_1, detaching);
    			if_block2.d();
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(48:0) <ContentWrapper>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let contentwrapper;
    	let current;

    	contentwrapper = new ContentWrapper({
    			props: {
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(contentwrapper.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(contentwrapper, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const contentwrapper_changes = {};

    			if (dirty & /*$$scope, handleAltAction, altActionTitle, actionTitle, $contentHabitDetailCategory, tempLocalUserHabit, selected, $contentHabitDuration*/ 33554559) {
    				contentwrapper_changes.$$scope = { dirty, ctx };
    			}

    			contentwrapper.$set(contentwrapper_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contentwrapper.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contentwrapper.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(contentwrapper, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $contentHabitDuration;
    	let $contentHabitDetailCategory;
    	validate_store(contentHabitDuration, "contentHabitDuration");
    	component_subscribe($$self, contentHabitDuration, $$value => $$invalidate(5, $contentHabitDuration = $$value));
    	validate_store(contentHabitDetailCategory, "contentHabitDetailCategory");
    	component_subscribe($$self, contentHabitDetailCategory, $$value => $$invalidate(6, $contentHabitDetailCategory = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AddEditDeleteHabit", slots, []);
    	let { tempLocalUserHabit } = $$props;
    	let { actionTitle } = $$props;
    	let { altActionTitle } = $$props;
    	let { handleAltAction } = $$props;
    	let { handleSubmit } = $$props;

    	const handleLocalSubmit = () => {
    		handleSubmit();
    	};

    	const getNewDate = () => {
    		return new Date();
    	};

    	let selected;

    	const handleSelectDuration = option => {
    		let dateStart = getNewDate();
    		let dateEnd = getNewDate();
    		dateEnd.setSeconds(dateEnd.getSeconds() + option.value);
    		$$invalidate(0, tempLocalUserHabit.adminDateStartUTCString = dateStart.toUTCString(), tempLocalUserHabit);
    		$$invalidate(0, tempLocalUserHabit.adminDateEndUTCString = dateEnd.toUTCString(), tempLocalUserHabit);
    		$$invalidate(0, tempLocalUserHabit.detailDuration = option.value, tempLocalUserHabit);
    	};

    	const handleToggleHabit = () => {
    		$$invalidate(0, tempLocalUserHabit.detailIsNewHabit = !tempLocalUserHabit.detailIsNewHabit, tempLocalUserHabit);
    	};

    	onMount(() => {
    		tempLocalUserHabit.adminIsActive
    		? ""
    		: handleSelectDuration($contentHabitDuration[0]);
    	});

    	const writable_props = [
    		"tempLocalUserHabit",
    		"actionTitle",
    		"altActionTitle",
    		"handleAltAction",
    		"handleSubmit"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AddEditDeleteHabit> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		tempLocalUserHabit.detailTitle = this.value;
    		$$invalidate(0, tempLocalUserHabit);
    	}

    	function select_change_handler() {
    		selected = select_value(this);
    		$$invalidate(4, selected);
    	}

    	const change_handler = () => handleSelectDuration(selected);

    	function textarea_input_handler() {
    		tempLocalUserHabit.detailDescription = this.value;
    		$$invalidate(0, tempLocalUserHabit);
    	}

    	function input1_input_handler() {
    		tempLocalUserHabit.detailCode = this.value;
    		$$invalidate(0, tempLocalUserHabit);
    	}

    	function input_change_handler(i) {
    		tempLocalUserHabit.detailCategory[`isCategory${i + 1}`] = this.checked;
    		$$invalidate(0, tempLocalUserHabit);
    	}

    	const click_handler = () => push("/");

    	$$self.$$set = $$props => {
    		if ("tempLocalUserHabit" in $$props) $$invalidate(0, tempLocalUserHabit = $$props.tempLocalUserHabit);
    		if ("actionTitle" in $$props) $$invalidate(1, actionTitle = $$props.actionTitle);
    		if ("altActionTitle" in $$props) $$invalidate(2, altActionTitle = $$props.altActionTitle);
    		if ("handleAltAction" in $$props) $$invalidate(3, handleAltAction = $$props.handleAltAction);
    		if ("handleSubmit" in $$props) $$invalidate(10, handleSubmit = $$props.handleSubmit);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		contentHabitDetailCategory,
    		contentHabitDuration,
    		push,
    		ContentWrapper,
    		AppHeader,
    		TwentyTwentyOne: _2021,
    		Modal,
    		tempLocalUserHabit,
    		actionTitle,
    		altActionTitle,
    		handleAltAction,
    		handleSubmit,
    		handleLocalSubmit,
    		getNewDate,
    		selected,
    		handleSelectDuration,
    		handleToggleHabit,
    		$contentHabitDuration,
    		$contentHabitDetailCategory
    	});

    	$$self.$inject_state = $$props => {
    		if ("tempLocalUserHabit" in $$props) $$invalidate(0, tempLocalUserHabit = $$props.tempLocalUserHabit);
    		if ("actionTitle" in $$props) $$invalidate(1, actionTitle = $$props.actionTitle);
    		if ("altActionTitle" in $$props) $$invalidate(2, altActionTitle = $$props.altActionTitle);
    		if ("handleAltAction" in $$props) $$invalidate(3, handleAltAction = $$props.handleAltAction);
    		if ("handleSubmit" in $$props) $$invalidate(10, handleSubmit = $$props.handleSubmit);
    		if ("selected" in $$props) $$invalidate(4, selected = $$props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		tempLocalUserHabit,
    		actionTitle,
    		altActionTitle,
    		handleAltAction,
    		selected,
    		$contentHabitDuration,
    		$contentHabitDetailCategory,
    		handleLocalSubmit,
    		handleSelectDuration,
    		handleToggleHabit,
    		handleSubmit,
    		input0_input_handler,
    		select_change_handler,
    		change_handler,
    		textarea_input_handler,
    		input1_input_handler,
    		input_change_handler,
    		click_handler
    	];
    }

    class AddEditDeleteHabit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			tempLocalUserHabit: 0,
    			actionTitle: 1,
    			altActionTitle: 2,
    			handleAltAction: 3,
    			handleSubmit: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddEditDeleteHabit",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*tempLocalUserHabit*/ ctx[0] === undefined && !("tempLocalUserHabit" in props)) {
    			console.warn("<AddEditDeleteHabit> was created without expected prop 'tempLocalUserHabit'");
    		}

    		if (/*actionTitle*/ ctx[1] === undefined && !("actionTitle" in props)) {
    			console.warn("<AddEditDeleteHabit> was created without expected prop 'actionTitle'");
    		}

    		if (/*altActionTitle*/ ctx[2] === undefined && !("altActionTitle" in props)) {
    			console.warn("<AddEditDeleteHabit> was created without expected prop 'altActionTitle'");
    		}

    		if (/*handleAltAction*/ ctx[3] === undefined && !("handleAltAction" in props)) {
    			console.warn("<AddEditDeleteHabit> was created without expected prop 'handleAltAction'");
    		}

    		if (/*handleSubmit*/ ctx[10] === undefined && !("handleSubmit" in props)) {
    			console.warn("<AddEditDeleteHabit> was created without expected prop 'handleSubmit'");
    		}
    	}

    	get tempLocalUserHabit() {
    		throw new Error("<AddEditDeleteHabit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tempLocalUserHabit(value) {
    		throw new Error("<AddEditDeleteHabit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get actionTitle() {
    		throw new Error("<AddEditDeleteHabit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set actionTitle(value) {
    		throw new Error("<AddEditDeleteHabit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get altActionTitle() {
    		throw new Error("<AddEditDeleteHabit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set altActionTitle(value) {
    		throw new Error("<AddEditDeleteHabit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleAltAction() {
    		throw new Error("<AddEditDeleteHabit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleAltAction(value) {
    		throw new Error("<AddEditDeleteHabit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleSubmit() {
    		throw new Error("<AddEditDeleteHabit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleSubmit(value) {
    		throw new Error("<AddEditDeleteHabit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/ScreenHabitAdd.svelte generated by Svelte v3.32.1 */

    const { Object: Object_1$2 } = globals;

    function create_fragment$e(ctx) {
    	let addeditdeletehabit;
    	let current;

    	addeditdeletehabit = new AddEditDeleteHabit({
    			props: {
    				tempLocalUserHabit: /*tempLocalUserHabit*/ ctx[0],
    				actionTitle: "Create Habit",
    				handleSubmit: /*handleSubmitCreateNewHabit*/ ctx[2],
    				altActionTitle: "Reset",
    				handleAltAction: /*handleReset*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(addeditdeletehabit.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(addeditdeletehabit, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const addeditdeletehabit_changes = {};
    			if (dirty & /*tempLocalUserHabit*/ 1) addeditdeletehabit_changes.tempLocalUserHabit = /*tempLocalUserHabit*/ ctx[0];
    			addeditdeletehabit.$set(addeditdeletehabit_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(addeditdeletehabit.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(addeditdeletehabit.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(addeditdeletehabit, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let $getUserHabitBlank;
    	let $indexActiveHabit;
    	let $userId;
    	let $API_ENDPOINT;
    	let $userHabitsActive;
    	validate_store(getUserHabitBlank, "getUserHabitBlank");
    	component_subscribe($$self, getUserHabitBlank, $$value => $$invalidate(3, $getUserHabitBlank = $$value));
    	validate_store(indexActiveHabit, "indexActiveHabit");
    	component_subscribe($$self, indexActiveHabit, $$value => $$invalidate(4, $indexActiveHabit = $$value));
    	validate_store(userId, "userId");
    	component_subscribe($$self, userId, $$value => $$invalidate(5, $userId = $$value));
    	validate_store(API_ENDPOINT, "API_ENDPOINT");
    	component_subscribe($$self, API_ENDPOINT, $$value => $$invalidate(6, $API_ENDPOINT = $$value));
    	validate_store(userHabitsActive, "userHabitsActive");
    	component_subscribe($$self, userHabitsActive, $$value => $$invalidate(7, $userHabitsActive = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ScreenHabitAdd", slots, []);
    	let tempLocalUserHabit = $getUserHabitBlank();
    	tempLocalUserHabit.detailIsNewHabit = true;

    	const handleReset = () => {
    		$$invalidate(0, tempLocalUserHabit = $getUserHabitBlank());
    	};

    	const handleSubmitCreateNewHabit = async () => {
    		Object.assign(tempLocalUserHabit, {
    			adminActivePosition: $indexActiveHabit,
    			adminIdUser: $userId
    		});

    		const fetchURL = $API_ENDPOINT + `/habits/${$userId}`;

    		const fetchOptions = {
    			method: "POST",
    			headers: { "content-type": "application/json" },
    			body: JSON.stringify({ ...tempLocalUserHabit })
    		};

    		const handleErrors = res => {
    			if (!res.ok) {
    				return res.text().then(text => {
    					throw text;
    				});
    			}

    			return res.json();
    		};

    		await fetch(fetchURL, fetchOptions).then(handleErrors).then(res => {
    			// console.log("res", res);
    			userProfile.set(res.userDetails);

    			let newHabitData = $userHabitsActive;
    			newHabitData[$indexActiveHabit] = res.newHabit;
    			userHabitsActive.set(newHabitData);
    			isLSDataOutdated.set(true);
    		}).catch(err => {
    			// console.clear();
    			errMessage.set(err);

    			push(`/error`);
    		});
    	};

    	const writable_props = [];

    	Object_1$2.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ScreenHabitAdd> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		errMessage,
    		API_ENDPOINT,
    		indexActiveHabit,
    		getUserHabitBlank,
    		userId,
    		userProfile,
    		userHabitsActive,
    		isLSDataOutdated,
    		push,
    		AppHeader,
    		TwentyTwentyOne: _2021,
    		AddEditDeleteHabit,
    		tempLocalUserHabit,
    		handleReset,
    		handleSubmitCreateNewHabit,
    		$getUserHabitBlank,
    		$indexActiveHabit,
    		$userId,
    		$API_ENDPOINT,
    		$userHabitsActive
    	});

    	$$self.$inject_state = $$props => {
    		if ("tempLocalUserHabit" in $$props) $$invalidate(0, tempLocalUserHabit = $$props.tempLocalUserHabit);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [tempLocalUserHabit, handleReset, handleSubmitCreateNewHabit];
    }

    class ScreenHabitAdd extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScreenHabitAdd",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/routes/ScreenHabitEdit.svelte generated by Svelte v3.32.1 */

    const { console: console_1$2 } = globals;
    const file$d = "src/routes/ScreenHabitEdit.svelte";

    // (123:0) {#if habitDeleteWarning}
    function create_if_block$5(ctx) {
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				contentModal: /*contentModalDelete*/ ctx[2],
    				$$slots: { default: [create_default_slot$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modal_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(123:0) {#if habitDeleteWarning}",
    		ctx
    	});

    	return block;
    }

    // (124:2) <Modal contentModal={contentModalDelete}>
    function create_default_slot$6(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = `${/*contentModalDelete*/ ctx[2].button}`;
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "inline-flex justify-center w-full rounded-md border\n      border-transparent shadow-sm px-4 py-2 bg-blue-900 text-base font-medium\n      text-white hover:bg-blue-500 focus:outline-none focus:ring-2\n      focus:ring-offset-2 focus:ring-blue-700 sm:text-sm");
    			add_location(button, file$d, 124, 4, 3130);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleModalDeleteAction*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(124:2) <Modal contentModal={contentModalDelete}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let addeditdeletehabit;
    	let t;
    	let if_block_anchor;
    	let current;

    	addeditdeletehabit = new AddEditDeleteHabit({
    			props: {
    				tempLocalUserHabit: /*tempLocalUserHabit*/ ctx[1],
    				actionTitle: "Update Habit",
    				handleSubmit: /*handleSubmitEditExistingHabit*/ ctx[5],
    				altActionTitle: "Delete",
    				handleAltAction: /*handleDelete*/ ctx[4]
    			},
    			$$inline: true
    		});

    	let if_block = /*habitDeleteWarning*/ ctx[0] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			create_component(addeditdeletehabit.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(addeditdeletehabit, target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*habitDeleteWarning*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*habitDeleteWarning*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(addeditdeletehabit.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(addeditdeletehabit.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(addeditdeletehabit, detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let $userHabitsActive;
    	let $indexActiveHabit;
    	let $API_ENDPOINT;
    	validate_store(userHabitsActive, "userHabitsActive");
    	component_subscribe($$self, userHabitsActive, $$value => $$invalidate(6, $userHabitsActive = $$value));
    	validate_store(indexActiveHabit, "indexActiveHabit");
    	component_subscribe($$self, indexActiveHabit, $$value => $$invalidate(7, $indexActiveHabit = $$value));
    	validate_store(API_ENDPOINT, "API_ENDPOINT");
    	component_subscribe($$self, API_ENDPOINT, $$value => $$invalidate(8, $API_ENDPOINT = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ScreenHabitEdit", slots, []);
    	let tempLocalUserHabit = $userHabitsActive[$indexActiveHabit];

    	let contentModalDelete = {
    		title: "Are You Sure You Want to Delete?",
    		details: "You will lose all data associated with this habit.",
    		button: "Delete Habit Data"
    	};

    	const handleModalDeleteAction = async () => {
    		const fetchURL = $API_ENDPOINT + `/habits/${tempLocalUserHabit.adminIdHabit}`;

    		const fetchOptions = {
    			method: "DELETE",
    			headers: { "content-type": "application/json" },
    			body: JSON.stringify({ ...tempLocalUserHabit })
    		};

    		const handleErrors = res => {
    			if (!res.ok) {
    				return res.text().then(text => {
    					throw text;
    				});
    			}

    			return res.json();
    		};

    		await fetch(fetchURL, fetchOptions).then(handleErrors).then(res => {
    			console.log("res", res);
    			let newHabitData = $userHabitsActive;
    			newHabitData[$indexActiveHabit] = {};
    			userHabitsActive.set(newHabitData);
    			userProfile.set(res.userProfile);
    			isLSDataOutdated.set(true);
    		}).catch(err => {
    			// console.clear();
    			errMessage.set(err);

    			push(`/error`);
    		});

    		$$invalidate(0, habitDeleteWarning = false);
    	};

    	let habitDeleteWarning = false;

    	const handleDelete = () => {
    		$$invalidate(0, habitDeleteWarning = true);
    	};

    	const handleSubmitEditExistingHabit = async () => {
    		const fetchURL = $API_ENDPOINT + `/habits/${tempLocalUserHabit.adminIdHabit}`;

    		const fetchOptions = {
    			method: "PATCH",
    			headers: { "content-type": "application/json" },
    			body: JSON.stringify({ ...tempLocalUserHabit })
    		};

    		const handleErrors = res => {
    			if (!res.ok) {
    				return res.text().then(text => {
    					throw text;
    				});
    			}

    			return res.json();
    		};

    		await fetch(fetchURL, fetchOptions).then(handleErrors).then(res => {
    			// console.log("res", res);
    			let newHabitData = $userHabitsActive;

    			newHabitData[$indexActiveHabit] = res.updatedHabit;
    			userHabitsActive.set(newHabitData);
    			isLSDataOutdated.set(true);
    		}).catch(err => {
    			// console.clear();
    			errMessage.set(err);

    			push(`/error`);
    		});
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<ScreenHabitEdit> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		errMessage,
    		API_ENDPOINT,
    		indexActiveHabit,
    		userHabitsActive,
    		userProfile,
    		isLSDataOutdated,
    		push,
    		AppHeader,
    		TwentyTwentyOne: _2021,
    		Modal,
    		AddEditDeleteHabit,
    		tempLocalUserHabit,
    		contentModalDelete,
    		handleModalDeleteAction,
    		habitDeleteWarning,
    		handleDelete,
    		handleSubmitEditExistingHabit,
    		$userHabitsActive,
    		$indexActiveHabit,
    		$API_ENDPOINT
    	});

    	$$self.$inject_state = $$props => {
    		if ("tempLocalUserHabit" in $$props) $$invalidate(1, tempLocalUserHabit = $$props.tempLocalUserHabit);
    		if ("contentModalDelete" in $$props) $$invalidate(2, contentModalDelete = $$props.contentModalDelete);
    		if ("habitDeleteWarning" in $$props) $$invalidate(0, habitDeleteWarning = $$props.habitDeleteWarning);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		habitDeleteWarning,
    		tempLocalUserHabit,
    		contentModalDelete,
    		handleModalDeleteAction,
    		handleDelete,
    		handleSubmitEditExistingHabit
    	];
    }

    class ScreenHabitEdit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScreenHabitEdit",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src/routes/ScreenHabitReflect.svelte generated by Svelte v3.32.1 */

    const { Object: Object_1$3, console: console_1$3 } = globals;
    const file$e = "src/routes/ScreenHabitReflect.svelte";

    // (251:12) {:else}
    function create_else_block_5$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("1 hour");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_5$1.name,
    		type: "else",
    		source: "(251:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (249:65) 
    function create_if_block_8$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("24 hours");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8$1.name,
    		type: "if",
    		source: "(249:65) ",
    		ctx
    	});

    	return block;
    }

    // (247:12) {#if tempLocalUserHabit.detailDuration > 86400}
    function create_if_block_7$1(ctx) {
    	let t0_value = /*tempLocalUserHabit*/ ctx[0].detailDuration / 86400 + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = text(" days");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tempLocalUserHabit*/ 1 && t0_value !== (t0_value = /*tempLocalUserHabit*/ ctx[0].detailDuration / 86400 + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$1.name,
    		type: "if",
    		source: "(247:12) {#if tempLocalUserHabit.detailDuration > 86400}",
    		ctx
    	});

    	return block;
    }

    // (269:12) {:else}
    function create_else_block_4$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("+");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_4$1.name,
    		type: "else",
    		source: "(269:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (267:12) {#if tempLocalUserHabit.detailCode}
    function create_if_block_6$1(ctx) {
    	let t_value = /*tempLocalUserHabit*/ ctx[0].detailCode + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tempLocalUserHabit*/ 1 && t_value !== (t_value = /*tempLocalUserHabit*/ ctx[0].detailCode + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$1.name,
    		type: "if",
    		source: "(267:12) {#if tempLocalUserHabit.detailCode}",
    		ctx
    	});

    	return block;
    }

    // (294:12) {:else}
    function create_else_block_3$1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "fail";
    			attr_dev(span, "class", "bg-red-100 text-red-700 px-2 rounded-sm");
    			add_location(span, file$e, 294, 14, 8075);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_3$1.name,
    		type: "else",
    		source: "(294:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (290:69) 
    function create_if_block_5$1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "active";
    			attr_dev(span, "class", "bg-blue-100 text-blue-700 px-2 rounded-sm");
    			add_location(span, file$e, 290, 14, 7939);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(290:69) ",
    		ctx
    	});

    	return block;
    }

    // (286:12) {#if tempLocalUserHabit.reflectIsSuccessful}
    function create_if_block_4$1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "success";
    			attr_dev(span, "class", "bg-green-100 text-green-700 py-1 px-2 rounded-sm");
    			add_location(span, file$e, 286, 14, 7745);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(286:12) {#if tempLocalUserHabit.reflectIsSuccessful}",
    		ctx
    	});

    	return block;
    }

    // (318:10) {:else}
    function create_else_block_2$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("What will you do? Who will you become? Tap the [Add] button below to\n            create a new habit.");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2$2.name,
    		type: "else",
    		source: "(318:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (316:10) {#if tempLocalUserHabit}
    function create_if_block_3$2(ctx) {
    	let t_value = /*tempLocalUserHabit*/ ctx[0].detailDescription + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tempLocalUserHabit*/ 1 && t_value !== (t_value = /*tempLocalUserHabit*/ ctx[0].detailDescription + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(316:10) {#if tempLocalUserHabit}",
    		ctx
    	});

    	return block;
    }

    // (390:12) {:else}
    function create_else_block_1$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Habit was not a sucesss");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$3.name,
    		type: "else",
    		source: "(390:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (388:12) {#if tempLocalUserHabit.reflectIsSuccessful}
    function create_if_block_2$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Habit completed successfully");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(388:12) {#if tempLocalUserHabit.reflectIsSuccessful}",
    		ctx
    	});

    	return block;
    }

    // (420:12) {:else}
    function create_else_block$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("I do not recommend this habit");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(420:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (418:12) {#if tempLocalUserHabit.reflectRecommend}
    function create_if_block_1$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("I do recommend this habit to others");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(418:12) {#if tempLocalUserHabit.reflectRecommend}",
    		ctx
    	});

    	return block;
    }

    // (233:0) <ContentWrapper>
    function create_default_slot_1$4(ctx) {
    	let div21;
    	let form;
    	let div4;
    	let div3;
    	let div0;
    	let t0;
    	let span0;
    	let t1;
    	let span1;
    	let t3;
    	let div1;
    	let t4;
    	let span2;
    	let t5;
    	let span3;
    	let t7;
    	let div2;
    	let t8;
    	let span4;
    	let t9;
    	let span5;
    	let t11;
    	let div5;
    	let h1;
    	let t12_value = /*tempLocalUserHabit*/ ctx[0].detailTitle + "";
    	let t12;
    	let t13;
    	let p;
    	let t14;
    	let div7;
    	let label0;
    	let t16;
    	let div6;
    	let textarea;
    	let t17;
    	let div9;
    	let label1;
    	let t18;
    	let t19_value = /*tempLocalUserHabit*/ ctx[0].reflectDifficulty + "";
    	let t19;
    	let t20;
    	let div8;
    	let input;
    	let t21;
    	let div10;
    	let button0;
    	let span6;
    	let t23;
    	let span7;
    	let t24;
    	let span9;
    	let span8;
    	let t25;
    	let div11;
    	let button1;
    	let span10;
    	let t27;
    	let span11;
    	let t28;
    	let span13;
    	let span12;
    	let t29;
    	let div12;
    	let button2;
    	let t31;
    	let div20;
    	let div16;
    	let div14;
    	let div13;
    	let t32;
    	let div15;
    	let span14;
    	let t34;
    	let div19;
    	let div17;
    	let button3;
    	let span15;
    	let t36;
    	let div18;
    	let button4;
    	let span16;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*tempLocalUserHabit*/ ctx[0].detailDuration > 86400) return create_if_block_7$1;
    		if (/*tempLocalUserHabit*/ ctx[0].detailDuration == 86400) return create_if_block_8$1;
    		return create_else_block_5$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*tempLocalUserHabit*/ ctx[0].detailCode) return create_if_block_6$1;
    		return create_else_block_4$1;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	function select_block_type_2(ctx, dirty) {
    		if (/*tempLocalUserHabit*/ ctx[0].reflectIsSuccessful) return create_if_block_4$1;
    		if (/*tempLocalUserHabit*/ ctx[0].reflectIsSuccessful == null) return create_if_block_5$1;
    		return create_else_block_3$1;
    	}

    	let current_block_type_2 = select_block_type_2(ctx);
    	let if_block2 = current_block_type_2(ctx);

    	function select_block_type_3(ctx, dirty) {
    		if (/*tempLocalUserHabit*/ ctx[0]) return create_if_block_3$2;
    		return create_else_block_2$2;
    	}

    	let current_block_type_3 = select_block_type_3(ctx);
    	let if_block3 = current_block_type_3(ctx);

    	function select_block_type_4(ctx, dirty) {
    		if (/*tempLocalUserHabit*/ ctx[0].reflectIsSuccessful) return create_if_block_2$3;
    		return create_else_block_1$3;
    	}

    	let current_block_type_4 = select_block_type_4(ctx);
    	let if_block4 = current_block_type_4(ctx);

    	function select_block_type_5(ctx, dirty) {
    		if (/*tempLocalUserHabit*/ ctx[0].reflectRecommend) return create_if_block_1$3;
    		return create_else_block$4;
    	}

    	let current_block_type_5 = select_block_type_5(ctx);
    	let if_block5 = current_block_type_5(ctx);

    	const block = {
    		c: function create() {
    			div21 = element("div");
    			form = element("form");
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			if_block0.c();
    			t0 = space();
    			span0 = element("span");
    			t1 = space();
    			span1 = element("span");
    			span1.textContent = "Habit Duration";
    			t3 = space();
    			div1 = element("div");
    			if_block1.c();
    			t4 = space();
    			span2 = element("span");
    			t5 = space();
    			span3 = element("span");
    			span3.textContent = "Habit Code";
    			t7 = space();
    			div2 = element("div");
    			if_block2.c();
    			t8 = space();
    			span4 = element("span");
    			t9 = space();
    			span5 = element("span");
    			span5.textContent = "Habit Status";
    			t11 = space();
    			div5 = element("div");
    			h1 = element("h1");
    			t12 = text(t12_value);
    			t13 = space();
    			p = element("p");
    			if_block3.c();
    			t14 = space();
    			div7 = element("div");
    			label0 = element("label");
    			label0.textContent = "Your reflection";
    			t16 = space();
    			div6 = element("div");
    			textarea = element("textarea");
    			t17 = space();
    			div9 = element("div");
    			label1 = element("label");
    			t18 = text("Habit Difficulty: ");
    			t19 = text(t19_value);
    			t20 = space();
    			div8 = element("div");
    			input = element("input");
    			t21 = space();
    			div10 = element("div");
    			button0 = element("button");
    			span6 = element("span");
    			span6.textContent = "Use setting";
    			t23 = space();
    			span7 = element("span");
    			t24 = space();
    			span9 = element("span");
    			span8 = element("span");
    			if_block4.c();
    			t25 = space();
    			div11 = element("div");
    			button1 = element("button");
    			span10 = element("span");
    			span10.textContent = "Use setting";
    			t27 = space();
    			span11 = element("span");
    			t28 = space();
    			span13 = element("span");
    			span12 = element("span");
    			if_block5.c();
    			t29 = space();
    			div12 = element("div");
    			button2 = element("button");
    			button2.textContent = "Save to History";
    			t31 = space();
    			div20 = element("div");
    			div16 = element("div");
    			div14 = element("div");
    			div13 = element("div");
    			t32 = space();
    			div15 = element("div");
    			span14 = element("span");
    			span14.textContent = "Or";
    			t34 = space();
    			div19 = element("div");
    			div17 = element("div");
    			button3 = element("button");
    			span15 = element("span");
    			span15.textContent = "Back";
    			t36 = space();
    			div18 = element("div");
    			button4 = element("button");
    			span16 = element("span");
    			span16.textContent = "Delete";
    			set_style(span0, "height", "50%");
    			set_style(span0, "top", "50%");
    			set_style(span0, "width", "28vw");
    			set_style(span0, "left", "calc(100% +\n              .5rem)");
    			attr_dev(span0, "class", "absolute text-blue-900 border-t-2 green-500");
    			add_location(span0, file$e, 251, 12, 6322);
    			set_style(span1, "left", "calc(100% + 28vw)");
    			attr_dev(span1, "class", "ml-2 p-2 rounded flex justify-center items-center absolute\n              top-0 bottom-0 leading-none text-xs font-extrabold text-gray-900\n              uppercase text-left");
    			add_location(span1, file$e, 255, 12, 6506);
    			attr_dev(div0, "class", "relative uppercase font-extrabold text-gray-900 text-xs\n            text-left");
    			add_location(div0, file$e, 243, 10, 5963);
    			set_style(span2, "height", "50%");
    			set_style(span2, "top", "50%");
    			set_style(span2, "width", "23vw");
    			set_style(span2, "left", "calc(100% +\n              .5rem)");
    			attr_dev(span2, "class", "absolute text-blue-900 border-t-2 green-500");
    			add_location(span2, file$e, 269, 12, 7063);
    			set_style(span3, "left", "calc(100% + 23vw)");
    			attr_dev(span3, "class", "ml-2 p-2 rounded flex justify-center items-center absolute\n              top-0 bottom-0 leading-none text-xs font-extrabold text-gray-900\n              uppercase text-left");
    			add_location(span3, file$e, 273, 12, 7247);
    			attr_dev(div1, "class", "relative mt-1 text-6xl font-extrabold text-center\n            text-blue-900");
    			add_location(div1, file$e, 263, 10, 6829);
    			set_style(span4, "height", "50%");
    			set_style(span4, "top", "50%");
    			set_style(span4, "width", "28vw");
    			set_style(span4, "left", "calc(100% +\n              .5rem)");
    			attr_dev(span4, "class", "absolute text-blue-900 border-t-2 green-500");
    			add_location(span4, file$e, 296, 12, 8171);
    			set_style(span5, "left", "calc(100% + 28vw)");
    			attr_dev(span5, "class", "ml-2 p-2 rounded flex justify-center items-center absolute\n              top-0 bottom-0 leading-none text-xs font-extrabold text-gray-900\n              uppercase text-left");
    			add_location(span5, file$e, 300, 12, 8355);
    			attr_dev(div2, "class", "relative mt-2 text-sm font-bold text-center text-gray-900\n            uppercase");
    			add_location(div2, file$e, 282, 10, 7568);
    			attr_dev(div3, "class", "flex flex-col mx-auto");
    			add_location(div3, file$e, 242, 8, 5917);
    			attr_dev(div4, "class", "w-1/3 bg-white py-1 px-2 border-2 border-blue-100 shadow\n        rounded-sm focus:outline-none");
    			add_location(div4, file$e, 239, 6, 5792);
    			attr_dev(h1, "class", "text-xl font-bold");
    			add_location(h1, file$e, 313, 8, 8717);
    			attr_dev(p, "class", "text-base mt-1 text-gray-700");
    			add_location(p, file$e, 314, 8, 8793);
    			add_location(div5, file$e, 312, 6, 8703);
    			attr_dev(label0, "for", "habit-reflect-comment");
    			attr_dev(label0, "class", "block text-sm font-medium text-gray-900");
    			add_location(label0, file$e, 325, 8, 9114);
    			attr_dev(textarea, "id", "habit-reflect-comment");
    			attr_dev(textarea, "name", "habit-reflect-comment");
    			textarea.required = true;
    			attr_dev(textarea, "rows", "3");
    			attr_dev(textarea, "placeholder", "This is where you write a brief description of your\n            results.");
    			attr_dev(textarea, "class", "appearance-none block w-full px-3 py-2 border border-gray-300\n            rounded-md shadow-sm placeholder-gray-400 focus:outline-none\n            focus:ring-blue-900 focus:border-blue-900 sm:text-sm");
    			add_location(textarea, file$e, 331, 10, 9298);
    			attr_dev(div6, "class", "mt-1");
    			add_location(div6, file$e, 330, 8, 9269);
    			add_location(div7, file$e, 324, 6, 9100);
    			attr_dev(label1, "for", "habit-reflect-difficulty");
    			attr_dev(label1, "class", "block text-sm font-medium text-gray-900");
    			add_location(label1, file$e, 346, 8, 9860);
    			attr_dev(input, "type", "range");
    			attr_dev(input, "id", "habit-reflect-difficulty");
    			attr_dev(input, "name", "habit-reflect-difficulty");
    			attr_dev(input, "min", "1");
    			attr_dev(input, "max", "10");
    			attr_dev(input, "step", "1");
    			attr_dev(input, "class", "h-8 w-full svelte-1qra9fn");
    			add_location(input, file$e, 353, 10, 10089);
    			attr_dev(div8, "class", "mt-1");
    			add_location(div8, file$e, 352, 8, 10060);
    			add_location(div9, file$e, 345, 6, 9846);
    			attr_dev(span6, "class", "sr-only");
    			add_location(span6, file$e, 377, 10, 10999);
    			attr_dev(span7, "aria-hidden", "true");
    			attr_dev(span7, "class", "translate-x-5 inline-block h-5 w-5 rounded-full bg-white\n            shadow transform ring-0 transition ease-in-out duration-200");
    			toggle_class(span7, "translate-x-5", /*tempLocalUserHabit*/ ctx[0].reflectIsSuccessful);
    			add_location(span7, file$e, 378, 10, 11050);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "aria-pressed", "false");
    			attr_dev(button0, "aria-labelledby", "toggleLabel");
    			attr_dev(button0, "class", "bg-gray-200 relative inline-flex flex-shrink-0 h-6 w-11\n          border-2 border-transparent rounded-full cursor-pointer\n          transition-colors ease-in-out duration-200 focus:outline-none\n          focus:ring-2 focus:ring-offset-2 focus:ring-blue-900");
    			toggle_class(button0, "bg-blue-900", /*tempLocalUserHabit*/ ctx[0].reflectIsSuccessful);
    			add_location(button0, file$e, 367, 8, 10495);
    			attr_dev(span8, "class", "text-sm font-medium text-gray-900");
    			add_location(span8, file$e, 386, 10, 11386);
    			attr_dev(span9, "class", "ml-3");
    			attr_dev(span9, "id", "toggleLabel");
    			add_location(span9, file$e, 385, 8, 11339);
    			attr_dev(div10, "class", "flex items-center");
    			add_location(div10, file$e, 365, 6, 10400);
    			attr_dev(span10, "class", "sr-only");
    			add_location(span10, file$e, 407, 10, 12308);
    			attr_dev(span11, "aria-hidden", "true");
    			attr_dev(span11, "class", "translate-x-5 inline-block h-5 w-5 rounded-full bg-white\n            shadow transform ring-0 transition ease-in-out duration-200");
    			toggle_class(span11, "translate-x-5", /*tempLocalUserHabit*/ ctx[0].reflectRecommend);
    			add_location(span11, file$e, 408, 10, 12359);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "aria-pressed", "false");
    			attr_dev(button1, "aria-labelledby", "toggleLabel");
    			attr_dev(button1, "class", "bg-gray-200 relative inline-flex flex-shrink-0 h-6 w-11\n          border-2 border-transparent rounded-full cursor-pointer\n          transition-colors ease-in-out duration-200 focus:outline-none\n          focus:ring-2 focus:ring-offset-2 focus:ring-blue-900");
    			toggle_class(button1, "bg-blue-900", /*tempLocalUserHabit*/ ctx[0].reflectRecommend);
    			add_location(button1, file$e, 397, 8, 11805);
    			attr_dev(span12, "class", "text-sm font-medium text-gray-900");
    			add_location(span12, file$e, 416, 10, 12692);
    			attr_dev(span13, "class", "ml-3");
    			attr_dev(span13, "id", "toggleLabel");
    			add_location(span13, file$e, 415, 8, 12645);
    			attr_dev(div11, "class", "flex items-center");
    			add_location(div11, file$e, 395, 6, 11710);
    			attr_dev(button2, "type", "submit");
    			attr_dev(button2, "class", "w-full flex justify-center py-2 px-4 border border-transparent\n          rounded-md shadow-sm text-sm font-bold text-white bg-blue-900\n          hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2\n          focus:ring-blue-900");
    			add_location(button2, file$e, 426, 8, 13053);
    			attr_dev(div12, "class", "mt-6");
    			add_location(div12, file$e, 425, 6, 13026);
    			attr_dev(form, "class", "space-y-6");
    			add_location(form, file$e, 236, 4, 5695);
    			attr_dev(div13, "class", "w-full border-t border-gray-300");
    			add_location(div13, file$e, 439, 10, 13537);
    			attr_dev(div14, "class", "absolute inset-0 flex items-center");
    			add_location(div14, file$e, 438, 8, 13478);
    			attr_dev(span14, "class", "px-2 bg-white text-gray-900");
    			add_location(span14, file$e, 442, 10, 13669);
    			attr_dev(div15, "class", "relative flex justify-center text-sm");
    			add_location(div15, file$e, 441, 8, 13608);
    			attr_dev(div16, "class", "relative");
    			add_location(div16, file$e, 437, 6, 13447);
    			attr_dev(span15, "class", "");
    			add_location(span15, file$e, 453, 12, 14074);
    			attr_dev(button3, "class", "w-full inline-flex justify-center py-2 px-4 border\n            border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium\n            text-gray-900 hover:bg-gray-50");
    			add_location(button3, file$e, 448, 10, 13822);
    			add_location(div17, file$e, 447, 8, 13806);
    			attr_dev(span16, "class", "");
    			add_location(span16, file$e, 462, 12, 14409);
    			attr_dev(button4, "class", "w-full inline-flex justify-center py-2 px-4 border\n            border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium\n            text-gray-900 hover:bg-gray-50");
    			add_location(button4, file$e, 457, 10, 14160);
    			add_location(div18, file$e, 456, 8, 14144);
    			attr_dev(div19, "class", "mt-6 grid grid-cols-2 gap-3");
    			add_location(div19, file$e, 446, 6, 13756);
    			attr_dev(div20, "class", "mt-6");
    			add_location(div20, file$e, 436, 4, 13422);
    			add_location(div21, file$e, 234, 2, 5684);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div21, anchor);
    			append_dev(div21, form);
    			append_dev(form, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			if_block0.m(div0, null);
    			append_dev(div0, t0);
    			append_dev(div0, span0);
    			append_dev(div0, t1);
    			append_dev(div0, span1);
    			append_dev(div3, t3);
    			append_dev(div3, div1);
    			if_block1.m(div1, null);
    			append_dev(div1, t4);
    			append_dev(div1, span2);
    			append_dev(div1, t5);
    			append_dev(div1, span3);
    			append_dev(div3, t7);
    			append_dev(div3, div2);
    			if_block2.m(div2, null);
    			append_dev(div2, t8);
    			append_dev(div2, span4);
    			append_dev(div2, t9);
    			append_dev(div2, span5);
    			append_dev(form, t11);
    			append_dev(form, div5);
    			append_dev(div5, h1);
    			append_dev(h1, t12);
    			append_dev(div5, t13);
    			append_dev(div5, p);
    			if_block3.m(p, null);
    			append_dev(form, t14);
    			append_dev(form, div7);
    			append_dev(div7, label0);
    			append_dev(div7, t16);
    			append_dev(div7, div6);
    			append_dev(div6, textarea);
    			set_input_value(textarea, /*tempLocalUserHabit*/ ctx[0].reflectComment);
    			append_dev(form, t17);
    			append_dev(form, div9);
    			append_dev(div9, label1);
    			append_dev(label1, t18);
    			append_dev(label1, t19);
    			append_dev(div9, t20);
    			append_dev(div9, div8);
    			append_dev(div8, input);
    			set_input_value(input, /*tempLocalUserHabit*/ ctx[0].reflectDifficulty);
    			append_dev(form, t21);
    			append_dev(form, div10);
    			append_dev(div10, button0);
    			append_dev(button0, span6);
    			append_dev(button0, t23);
    			append_dev(button0, span7);
    			append_dev(div10, t24);
    			append_dev(div10, span9);
    			append_dev(span9, span8);
    			if_block4.m(span8, null);
    			append_dev(form, t25);
    			append_dev(form, div11);
    			append_dev(div11, button1);
    			append_dev(button1, span10);
    			append_dev(button1, t27);
    			append_dev(button1, span11);
    			append_dev(div11, t28);
    			append_dev(div11, span13);
    			append_dev(span13, span12);
    			if_block5.m(span12, null);
    			append_dev(form, t29);
    			append_dev(form, div12);
    			append_dev(div12, button2);
    			append_dev(div21, t31);
    			append_dev(div21, div20);
    			append_dev(div20, div16);
    			append_dev(div16, div14);
    			append_dev(div14, div13);
    			append_dev(div16, t32);
    			append_dev(div16, div15);
    			append_dev(div15, span14);
    			append_dev(div20, t34);
    			append_dev(div20, div19);
    			append_dev(div19, div17);
    			append_dev(div17, button3);
    			append_dev(button3, span15);
    			append_dev(div19, t36);
    			append_dev(div19, div18);
    			append_dev(div18, button4);
    			append_dev(button4, span16);

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[8]),
    					listen_dev(input, "change", /*input_change_input_handler*/ ctx[9]),
    					listen_dev(input, "input", /*input_change_input_handler*/ ctx[9]),
    					listen_dev(button0, "click", /*handleToggleHabitSuccess*/ ctx[4], false, false, false),
    					listen_dev(button1, "click", /*handleToggleHabitRecommend*/ ctx[3], false, false, false),
    					listen_dev(form, "submit", prevent_default(/*handleModalHabitIsComplete*/ ctx[7]), false, true, false),
    					listen_dev(button3, "click", /*click_handler*/ ctx[10], false, false, false),
    					listen_dev(button4, "click", /*handleDelete*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div0, t0);
    				}
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div1, t4);
    				}
    			}

    			if (current_block_type_2 !== (current_block_type_2 = select_block_type_2(ctx))) {
    				if_block2.d(1);
    				if_block2 = current_block_type_2(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div2, t8);
    				}
    			}

    			if (dirty & /*tempLocalUserHabit*/ 1 && t12_value !== (t12_value = /*tempLocalUserHabit*/ ctx[0].detailTitle + "")) set_data_dev(t12, t12_value);

    			if (current_block_type_3 === (current_block_type_3 = select_block_type_3(ctx)) && if_block3) {
    				if_block3.p(ctx, dirty);
    			} else {
    				if_block3.d(1);
    				if_block3 = current_block_type_3(ctx);

    				if (if_block3) {
    					if_block3.c();
    					if_block3.m(p, null);
    				}
    			}

    			if (dirty & /*tempLocalUserHabit*/ 1) {
    				set_input_value(textarea, /*tempLocalUserHabit*/ ctx[0].reflectComment);
    			}

    			if (dirty & /*tempLocalUserHabit*/ 1 && t19_value !== (t19_value = /*tempLocalUserHabit*/ ctx[0].reflectDifficulty + "")) set_data_dev(t19, t19_value);

    			if (dirty & /*tempLocalUserHabit*/ 1) {
    				set_input_value(input, /*tempLocalUserHabit*/ ctx[0].reflectDifficulty);
    			}

    			if (dirty & /*tempLocalUserHabit*/ 1) {
    				toggle_class(span7, "translate-x-5", /*tempLocalUserHabit*/ ctx[0].reflectIsSuccessful);
    			}

    			if (dirty & /*tempLocalUserHabit*/ 1) {
    				toggle_class(button0, "bg-blue-900", /*tempLocalUserHabit*/ ctx[0].reflectIsSuccessful);
    			}

    			if (current_block_type_4 !== (current_block_type_4 = select_block_type_4(ctx))) {
    				if_block4.d(1);
    				if_block4 = current_block_type_4(ctx);

    				if (if_block4) {
    					if_block4.c();
    					if_block4.m(span8, null);
    				}
    			}

    			if (dirty & /*tempLocalUserHabit*/ 1) {
    				toggle_class(span11, "translate-x-5", /*tempLocalUserHabit*/ ctx[0].reflectRecommend);
    			}

    			if (dirty & /*tempLocalUserHabit*/ 1) {
    				toggle_class(button1, "bg-blue-900", /*tempLocalUserHabit*/ ctx[0].reflectRecommend);
    			}

    			if (current_block_type_5 !== (current_block_type_5 = select_block_type_5(ctx))) {
    				if_block5.d(1);
    				if_block5 = current_block_type_5(ctx);

    				if (if_block5) {
    					if_block5.c();
    					if_block5.m(span12, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div21);
    			if_block0.d();
    			if_block1.d();
    			if_block2.d();
    			if_block3.d();
    			if_block4.d();
    			if_block5.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$4.name,
    		type: "slot",
    		source: "(233:0) <ContentWrapper>",
    		ctx
    	});

    	return block;
    }

    // (473:0) {#if habitDeleteWarning}
    function create_if_block$6(ctx) {
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				contentModal: /*contentModalDelete*/ ctx[2],
    				$$slots: { default: [create_default_slot$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modal_changes = {};

    			if (dirty & /*$$scope*/ 32768) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(473:0) {#if habitDeleteWarning}",
    		ctx
    	});

    	return block;
    }

    // (474:2) <Modal contentModal={contentModalDelete}>
    function create_default_slot$7(ctx) {
    	let button0;
    	let t1;
    	let div5;
    	let div3;
    	let div1;
    	let div0;
    	let t2;
    	let div2;
    	let span0;
    	let t4;
    	let div4;
    	let button1;
    	let span1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button0 = element("button");
    			button0.textContent = `${/*contentModalDelete*/ ctx[2].button}`;
    			t1 = space();
    			div5 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t2 = space();
    			div2 = element("div");
    			span0 = element("span");
    			span0.textContent = "Or";
    			t4 = space();
    			div4 = element("div");
    			button1 = element("button");
    			span1 = element("span");
    			span1.textContent = "Back";
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "inline-flex justify-center w-full rounded-md border\n      border-transparent shadow-sm px-4 py-2 bg-blue-900 text-base font-medium\n      text-white hover:bg-blue-500 focus:outline-none focus:ring-2\n      focus:ring-offset-2 focus:ring-blue-700 sm:text-sm");
    			add_location(button0, file$e, 474, 4, 14600);
    			attr_dev(div0, "class", "w-full border-t border-gray-300");
    			add_location(div0, file$e, 486, 10, 15106);
    			attr_dev(div1, "class", "absolute inset-0 flex items-center");
    			add_location(div1, file$e, 485, 8, 15047);
    			attr_dev(span0, "class", "px-2 bg-white text-gray-900");
    			add_location(span0, file$e, 489, 10, 15238);
    			attr_dev(div2, "class", "relative flex justify-center text-sm");
    			add_location(div2, file$e, 488, 8, 15177);
    			attr_dev(div3, "class", "relative");
    			add_location(div3, file$e, 484, 6, 15016);
    			attr_dev(span1, "class", "");
    			add_location(span1, file$e, 500, 10, 15592);
    			attr_dev(button1, "class", "w-full inline-flex justify-center py-2 px-4 border\n          border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium\n          text-gray-900 hover:bg-gray-50");
    			add_location(button1, file$e, 495, 8, 15353);
    			attr_dev(div4, "class", "mt-6");
    			add_location(div4, file$e, 493, 6, 15325);
    			attr_dev(div5, "class", "mt-6");
    			add_location(div5, file$e, 483, 4, 14991);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div3);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, span0);
    			append_dev(div5, t4);
    			append_dev(div5, div4);
    			append_dev(div4, button1);
    			append_dev(button1, span1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*handleModalDeleteAction*/ ctx[6], false, false, false),
    					listen_dev(button1, "click", /*handleDelete*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div5);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$7.name,
    		type: "slot",
    		source: "(474:2) <Modal contentModal={contentModalDelete}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let contentwrapper;
    	let t;
    	let if_block_anchor;
    	let current;

    	contentwrapper = new ContentWrapper({
    			props: {
    				$$slots: { default: [create_default_slot_1$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block = /*habitDeleteWarning*/ ctx[1] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			create_component(contentwrapper.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(contentwrapper, target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const contentwrapper_changes = {};

    			if (dirty & /*$$scope, tempLocalUserHabit*/ 32769) {
    				contentwrapper_changes.$$scope = { dirty, ctx };
    			}

    			contentwrapper.$set(contentwrapper_changes);

    			if (/*habitDeleteWarning*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*habitDeleteWarning*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contentwrapper.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contentwrapper.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(contentwrapper, detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let $userHabitsActive;
    	let $indexActiveHabit;
    	let $API_ENDPOINT;
    	let $userHabitsHistory;
    	validate_store(userHabitsActive, "userHabitsActive");
    	component_subscribe($$self, userHabitsActive, $$value => $$invalidate(11, $userHabitsActive = $$value));
    	validate_store(indexActiveHabit, "indexActiveHabit");
    	component_subscribe($$self, indexActiveHabit, $$value => $$invalidate(12, $indexActiveHabit = $$value));
    	validate_store(API_ENDPOINT, "API_ENDPOINT");
    	component_subscribe($$self, API_ENDPOINT, $$value => $$invalidate(13, $API_ENDPOINT = $$value));
    	validate_store(userHabitsHistory, "userHabitsHistory");
    	component_subscribe($$self, userHabitsHistory, $$value => $$invalidate(14, $userHabitsHistory = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ScreenHabitReflect", slots, []);

    	let contentModalDelete = {
    		title: "Are You Sure You Want to Delete?",
    		details: "You will lose all data associated with this habit.",
    		button: "Delete Habit Data"
    	};

    	let tempLocalUserHabit = $userHabitsActive[$indexActiveHabit];
    	tempLocalUserHabit.reflectIsSuccessful = true;
    	tempLocalUserHabit.reflectDifficulty = 5;
    	tempLocalUserHabit.reflectRecommend = true;

    	const handleToggleHabitRecommend = () => {
    		$$invalidate(0, tempLocalUserHabit.reflectRecommend = !tempLocalUserHabit.reflectRecommend, tempLocalUserHabit);
    	};

    	const handleToggleHabitSuccess = () => {
    		$$invalidate(0, tempLocalUserHabit.reflectIsSuccessful = !tempLocalUserHabit.reflectIsSuccessful, tempLocalUserHabit);
    	};

    	let habitDeleteWarning = false;

    	const handleDelete = () => {
    		$$invalidate(1, habitDeleteWarning = !habitDeleteWarning);
    	};

    	const handleModalDeleteAction = async () => {
    		const fetchURL = $API_ENDPOINT + `/habits/${tempLocalUserHabit.adminIdHabit}`;

    		const fetchOptions = {
    			method: "DELETE",
    			headers: { "content-type": "application/json" },
    			body: JSON.stringify({ ...tempLocalUserHabit })
    		};

    		const handleErrors = res => {
    			if (!res.ok) {
    				return res.text().then(text => {
    					throw text;
    				});
    			}

    			return res.json();
    		};

    		await fetch(fetchURL, fetchOptions).then(handleErrors).then(res => {
    			// console.log("res", res);
    			let tempHabitsActive = $userHabitsActive;

    			tempHabitsActive[$indexActiveHabit] = {};
    			userHabitsActive.set(tempHabitsActive);
    			userProfile.set(res.updatedUser);
    			isLSDataOutdated.set(true);
    		}).catch(err => {
    			// console.clear();
    			errMessage.set(err);

    			push(`/error`);
    		});

    		$$invalidate(1, habitDeleteWarning = false);
    	};

    	const handleModalHabitIsComplete = async () => {
    		Object.assign(tempLocalUserHabit, {
    			adminActivePosition: null,
    			adminIsActive: false
    		});

    		const fetchURL = $API_ENDPOINT + `/habits/${tempLocalUserHabit.adminIdHabit}`;

    		const fetchOptions = {
    			method: "PATCH",
    			headers: { "content-type": "application/json" },
    			body: JSON.stringify({ ...tempLocalUserHabit })
    		};

    		const handleErrors = res => {
    			if (!res.ok) {
    				return res.text().then(text => {
    					throw text;
    				});
    			}

    			return res.json();
    		};

    		await fetch(fetchURL, fetchOptions).then(handleErrors).then(res => {
    			// console.log("res", res);
    			let tempHabitsActive = $userHabitsActive;

    			let tempHabitsHistory = $userHabitsHistory;
    			tempHabitsHistory.push(tempLocalUserHabit);
    			userHabitsHistory.set(tempHabitsHistory);
    			tempHabitsActive[$indexActiveHabit] = {};
    			userHabitsActive.set(tempHabitsActive);
    			userProfile.set(res.updatedUser);
    			isLSDataOutdated.set(true);
    		}).catch(err => {
    			console.clear();
    			errMessage.set(err);
    			push(`/error`);
    		});
    	};

    	const writable_props = [];

    	Object_1$3.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<ScreenHabitReflect> was created with unknown prop '${key}'`);
    	});

    	function textarea_input_handler() {
    		tempLocalUserHabit.reflectComment = this.value;
    		$$invalidate(0, tempLocalUserHabit);
    	}

    	function input_change_input_handler() {
    		tempLocalUserHabit.reflectDifficulty = to_number(this.value);
    		$$invalidate(0, tempLocalUserHabit);
    	}

    	const click_handler = () => push("/");

    	$$self.$capture_state = () => ({
    		onMount,
    		errMessage,
    		API_ENDPOINT,
    		indexActiveHabit,
    		userId,
    		userHabitsActive,
    		userHabitsHistory,
    		userProfile,
    		isLSDataOutdated,
    		push,
    		AppHeader,
    		TwentyTwentyOne: _2021,
    		Modal,
    		ContentWrapper,
    		contentModalDelete,
    		tempLocalUserHabit,
    		handleToggleHabitRecommend,
    		handleToggleHabitSuccess,
    		habitDeleteWarning,
    		handleDelete,
    		handleModalDeleteAction,
    		handleModalHabitIsComplete,
    		$userHabitsActive,
    		$indexActiveHabit,
    		$API_ENDPOINT,
    		$userHabitsHistory
    	});

    	$$self.$inject_state = $$props => {
    		if ("contentModalDelete" in $$props) $$invalidate(2, contentModalDelete = $$props.contentModalDelete);
    		if ("tempLocalUserHabit" in $$props) $$invalidate(0, tempLocalUserHabit = $$props.tempLocalUserHabit);
    		if ("habitDeleteWarning" in $$props) $$invalidate(1, habitDeleteWarning = $$props.habitDeleteWarning);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		tempLocalUserHabit,
    		habitDeleteWarning,
    		contentModalDelete,
    		handleToggleHabitRecommend,
    		handleToggleHabitSuccess,
    		handleDelete,
    		handleModalDeleteAction,
    		handleModalHabitIsComplete,
    		textarea_input_handler,
    		input_change_input_handler,
    		click_handler
    	];
    }

    class ScreenHabitReflect extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScreenHabitReflect",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src/components/HistoryCard.svelte generated by Svelte v3.32.1 */

    const { console: console_1$4 } = globals;
    const file$f = "src/components/HistoryCard.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (25:8) {:else}
    function create_else_block_3$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("1 min");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_3$2.name,
    		type: "else",
    		source: "(25:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (23:44) 
    function create_if_block_10$1(ctx) {
    	let t0_value = /*habit*/ ctx[0].detailDuration / 60 + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = text(" mins");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*habit*/ 1 && t0_value !== (t0_value = /*habit*/ ctx[0].detailDuration / 60 + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10$1.name,
    		type: "if",
    		source: "(23:44) ",
    		ctx
    	});

    	return block;
    }

    // (21:47) 
    function create_if_block_9$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("60 mins");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9$1.name,
    		type: "if",
    		source: "(21:47) ",
    		ctx
    	});

    	return block;
    }

    // (19:46) 
    function create_if_block_8$2(ctx) {
    	let t0_value = /*habit*/ ctx[0].detailDuration / 3600 + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = text(" hours");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*habit*/ 1 && t0_value !== (t0_value = /*habit*/ ctx[0].detailDuration / 3600 + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8$2.name,
    		type: "if",
    		source: "(19:46) ",
    		ctx
    	});

    	return block;
    }

    // (17:48) 
    function create_if_block_7$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("24 hours");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$2.name,
    		type: "if",
    		source: "(17:48) ",
    		ctx
    	});

    	return block;
    }

    // (15:8) {#if habit.detailDuration > 86400}
    function create_if_block_6$2(ctx) {
    	let t0_value = /*habit*/ ctx[0].detailDuration / 86400 + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = text(" days");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*habit*/ 1 && t0_value !== (t0_value = /*habit*/ ctx[0].detailDuration / 86400 + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$2.name,
    		type: "if",
    		source: "(15:8) {#if habit.detailDuration > 86400}",
    		ctx
    	});

    	return block;
    }

    // (29:48) {:else}
    function create_else_block_2$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("+");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2$3.name,
    		type: "else",
    		source: "(29:48) {:else}",
    		ctx
    	});

    	return block;
    }

    // (29:8) {#if habit.detailCode}
    function create_if_block_5$2(ctx) {
    	let t_value = /*habit*/ ctx[0].detailCode + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*habit*/ 1 && t_value !== (t_value = /*habit*/ ctx[0].detailCode + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$2.name,
    		type: "if",
    		source: "(29:8) {#if habit.detailCode}",
    		ctx
    	});

    	return block;
    }

    // (41:8) {:else}
    function create_else_block_1$4(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "fail";
    			attr_dev(span, "class", "bg-red-100 text-red-700 px-2 rounded-sm");
    			add_location(span, file$f, 41, 10, 1504);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$4.name,
    		type: "else",
    		source: "(41:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (39:52) 
    function create_if_block_4$2(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "active";
    			attr_dev(span, "class", "bg-blue-100 text-blue-700 px-2 rounded-sm");
    			add_location(span, file$f, 39, 10, 1408);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$2.name,
    		type: "if",
    		source: "(39:52) ",
    		ctx
    	});

    	return block;
    }

    // (35:8) {#if habit.reflectIsSuccessful}
    function create_if_block_3$3(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "success";
    			attr_dev(span, "class", "bg-green-100 text-green-700 py-1 px-2 rounded-sm");
    			add_location(span, file$f, 35, 10, 1243);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$3.name,
    		type: "if",
    		source: "(35:8) {#if habit.reflectIsSuccessful}",
    		ctx
    	});

    	return block;
    }

    // (67:8) {#if i < 15}
    function create_if_block_1$4(ctx) {
    	let li;

    	function select_block_type_3(ctx, dirty) {
    		if (/*check*/ ctx[2].isOk) return create_if_block_2$4;
    		return create_else_block$5;
    	}

    	let current_block_type = select_block_type_3(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			if_block.c();
    			add_location(li, file$f, 67, 10, 2285);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			if_block.m(li, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type_3(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(li, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(67:8) {#if i < 15}",
    		ctx
    	});

    	return block;
    }

    // (71:12) {:else}
    function create_else_block$5(ctx) {
    	let i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "bg-red-100 far fa-1x fa-window-close");
    			add_location(i, file$f, 71, 14, 2420);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(71:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (69:12) {#if check.isOk}
    function create_if_block_2$4(ctx) {
    	let i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "bg-green-100 far fa-1x fa-check-square");
    			add_location(i, file$f, 69, 14, 2333);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(69:12) {#if check.isOk}",
    		ctx
    	});

    	return block;
    }

    // (76:8) {#if i === 15}
    function create_if_block$7(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "...\n          ";
    			attr_dev(div, "class", "w-full text-xs font-extrabold text-gray-900 uppercase\n            text-center");
    			add_location(div, file$f, 76, 10, 2552);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(76:8) {#if i === 15}",
    		ctx
    	});

    	return block;
    }

    // (66:6) {#each habit.checks as check, i}
    function create_each_block$2(ctx) {
    	let t;
    	let if_block1_anchor;
    	let if_block0 = /*i*/ ctx[4] < 15 && create_if_block_1$4(ctx);
    	let if_block1 = /*i*/ ctx[4] === 15 && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*i*/ ctx[4] < 15) if_block0.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(66:6) {#each habit.checks as check, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let div9;
    	let div4;
    	let div3;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;
    	let t2;
    	let div8;
    	let div5;
    	let t3_value = /*habit*/ ctx[0].detailTitle + "";
    	let t3;
    	let t4;
    	let div6;
    	let t5;
    	let t6_value = /*habit*/ ctx[0].adminDateEndUTCString.slice(0, 16) + "";
    	let t6;
    	let t7;
    	let div7;
    	let t8;
    	let t9_value = /*habit*/ ctx[0].adminDateStartUTCString.slice(0, 16) + "";
    	let t9;
    	let t10;
    	let ul;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*habit*/ ctx[0].detailDuration > 86400) return create_if_block_6$2;
    		if (/*habit*/ ctx[0].detailDuration == 86400) return create_if_block_7$2;
    		if (/*habit*/ ctx[0].detailDuration > 3600) return create_if_block_8$2;
    		if (/*habit*/ ctx[0].detailDuration == 3600) return create_if_block_9$1;
    		if (/*habit*/ ctx[0].detailDuration > 60) return create_if_block_10$1;
    		return create_else_block_3$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*habit*/ ctx[0].detailCode) return create_if_block_5$2;
    		return create_else_block_2$3;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	function select_block_type_2(ctx, dirty) {
    		if (/*habit*/ ctx[0].reflectIsSuccessful) return create_if_block_3$3;
    		if (/*habit*/ ctx[0].reflectIsSuccessful == null) return create_if_block_4$2;
    		return create_else_block_1$4;
    	}

    	let current_block_type_2 = select_block_type_2(ctx);
    	let if_block2 = current_block_type_2(ctx);
    	let each_value = /*habit*/ ctx[0].checks;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			if_block0.c();
    			t0 = space();
    			div1 = element("div");
    			if_block1.c();
    			t1 = space();
    			div2 = element("div");
    			if_block2.c();
    			t2 = space();
    			div8 = element("div");
    			div5 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			div6 = element("div");
    			t5 = text("Start: ");
    			t6 = text(t6_value);
    			t7 = space();
    			div7 = element("div");
    			t8 = text("End: ");
    			t9 = text(t9_value);
    			t10 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "relative uppercase font-extrabold text-gray-900 text-xs text-left");
    			add_location(div0, file$f, 12, 6, 390);
    			attr_dev(div1, "class", "relative mt-1 text-6xl font-extrabold text-center text-blue-900");
    			add_location(div1, file$f, 26, 6, 927);
    			attr_dev(div2, "class", "relative mt-2 text-sm font-bold text-center text-gray-900\n        uppercase");
    			add_location(div2, file$f, 31, 6, 1095);
    			attr_dev(div3, "class", "flex flex-col mx-auto");
    			add_location(div3, file$f, 11, 4, 348);
    			attr_dev(div4, "class", "w-1/3 py-1 px-2 ");
    			add_location(div4, file$f, 8, 2, 252);
    			attr_dev(div5, "class", "ml-2 pl-2 pt-3 ltext-xs font-extrabold text-gray-900 uppercase\n      text-left");
    			add_location(div5, file$f, 48, 4, 1645);
    			attr_dev(div6, "class", "ml-2 pl-2 pt-0 text-xs font-extrabold text-gray-500 uppercase\n      text-left");
    			add_location(div6, file$f, 53, 4, 1785);
    			attr_dev(div7, "class", "ml-2 pl-2 text-xs font-extrabold text-gray-500 uppercase text-left");
    			add_location(div7, file$f, 58, 4, 1954);
    			attr_dev(ul, "class", "ml-2 pt-1 place-items-center grid grid-cols-8 grid-cols-2 w-4/5\n      leading-tight");
    			add_location(ul, file$f, 62, 4, 2112);
    			attr_dev(div8, "class", "w-full");
    			add_location(div8, file$f, 47, 2, 1620);
    			attr_dev(div9, "class", "mx-auto flex py-1 border-2 border-blue-100 shadow rounded-sm bg-white\n  hover:bg-blue-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-900\n  focus:outline-none transition-colors duration-75");
    			add_location(div9, file$f, 4, 0, 40);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			if_block0.m(div0, null);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			if_block1.m(div1, null);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			if_block2.m(div2, null);
    			append_dev(div9, t2);
    			append_dev(div9, div8);
    			append_dev(div8, div5);
    			append_dev(div5, t3);
    			append_dev(div8, t4);
    			append_dev(div8, div6);
    			append_dev(div6, t5);
    			append_dev(div6, t6);
    			append_dev(div8, t7);
    			append_dev(div8, div7);
    			append_dev(div7, t8);
    			append_dev(div7, t9);
    			append_dev(div8, t10);
    			append_dev(div8, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			if (!mounted) {
    				dispose = listen_dev(div4, "click", /*click_handler*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			}

    			if (current_block_type_2 !== (current_block_type_2 = select_block_type_2(ctx))) {
    				if_block2.d(1);
    				if_block2 = current_block_type_2(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div2, null);
    				}
    			}

    			if (dirty & /*habit*/ 1 && t3_value !== (t3_value = /*habit*/ ctx[0].detailTitle + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*habit*/ 1 && t6_value !== (t6_value = /*habit*/ ctx[0].adminDateEndUTCString.slice(0, 16) + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*habit*/ 1 && t9_value !== (t9_value = /*habit*/ ctx[0].adminDateStartUTCString.slice(0, 16) + "")) set_data_dev(t9, t9_value);

    			if (dirty & /*habit*/ 1) {
    				each_value = /*habit*/ ctx[0].checks;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    			if_block0.d();
    			if_block1.d();
    			if_block2.d();
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("HistoryCard", slots, []);
    	let { habit } = $$props;
    	const writable_props = ["habit"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$4.warn(`<HistoryCard> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => console.log("Habit button clicked");

    	$$self.$$set = $$props => {
    		if ("habit" in $$props) $$invalidate(0, habit = $$props.habit);
    	};

    	$$self.$capture_state = () => ({ habit });

    	$$self.$inject_state = $$props => {
    		if ("habit" in $$props) $$invalidate(0, habit = $$props.habit);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [habit, click_handler];
    }

    class HistoryCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { habit: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HistoryCard",
    			options,
    			id: create_fragment$h.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*habit*/ ctx[0] === undefined && !("habit" in props)) {
    			console_1$4.warn("<HistoryCard> was created without expected prop 'habit'");
    		}
    	}

    	get habit() {
    		throw new Error("<HistoryCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set habit(value) {
    		throw new Error("<HistoryCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/ScreenHabitHistory.svelte generated by Svelte v3.32.1 */

    const { console: console_1$5 } = globals;
    const file$g = "src/routes/ScreenHabitHistory.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (65:4) {#if habit && !$isObjectEmpty(habit)}
    function create_if_block_1$5(ctx) {
    	let historycard;
    	let current;

    	historycard = new HistoryCard({
    			props: { habit: /*habit*/ ctx[9] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(historycard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(historycard, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const historycard_changes = {};
    			if (dirty & /*$userHabitsActive*/ 2) historycard_changes.habit = /*habit*/ ctx[9];
    			historycard.$set(historycard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(historycard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(historycard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(historycard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(65:4) {#if habit && !$isObjectEmpty(habit)}",
    		ctx
    	});

    	return block;
    }

    // (64:2) {#each $userHabitsActive as habit}
    function create_each_block_1$1(ctx) {
    	let show_if = /*habit*/ ctx[9] && !/*$isObjectEmpty*/ ctx[2](/*habit*/ ctx[9]);
    	let if_block_anchor;
    	let current;
    	let if_block = show_if && create_if_block_1$5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$userHabitsActive, $isObjectEmpty*/ 6) show_if = /*habit*/ ctx[9] && !/*$isObjectEmpty*/ ctx[2](/*habit*/ ctx[9]);

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$userHabitsActive, $isObjectEmpty*/ 6) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(64:2) {#each $userHabitsActive as habit}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   import {     userProfile,     userHabitsActive,     userHabitsHistory,     isObjectEmpty,     API_ENDPOINT,     errMessage,     userId,     isLSDataOutdated,     isDataOutdatedHistory   }
    function create_catch_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script>   import {     userProfile,     userHabitsActive,     userHabitsHistory,     isObjectEmpty,     API_ENDPOINT,     errMessage,     userId,     isLSDataOutdated,     isDataOutdatedHistory   }",
    		ctx
    	});

    	return block;
    }

    // (71:2) {:then}
    function create_then_block(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*$userHabitsHistory*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$userHabitsHistory, $isObjectEmpty*/ 12) {
    				each_value = /*$userHabitsHistory*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(71:2) {:then}",
    		ctx
    	});

    	return block;
    }

    // (73:6) {#if habit && !$isObjectEmpty(habit)}
    function create_if_block$8(ctx) {
    	let historycard;
    	let current;

    	historycard = new HistoryCard({
    			props: { habit: /*habit*/ ctx[9] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(historycard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(historycard, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const historycard_changes = {};
    			if (dirty & /*$userHabitsHistory*/ 8) historycard_changes.habit = /*habit*/ ctx[9];
    			historycard.$set(historycard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(historycard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(historycard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(historycard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(73:6) {#if habit && !$isObjectEmpty(habit)}",
    		ctx
    	});

    	return block;
    }

    // (72:4) {#each $userHabitsHistory as habit}
    function create_each_block$3(ctx) {
    	let show_if = /*habit*/ ctx[9] && !/*$isObjectEmpty*/ ctx[2](/*habit*/ ctx[9]);
    	let if_block_anchor;
    	let current;
    	let if_block = show_if && create_if_block$8(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$userHabitsHistory, $isObjectEmpty*/ 12) show_if = /*habit*/ ctx[9] && !/*$isObjectEmpty*/ ctx[2](/*habit*/ ctx[9]);

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$userHabitsHistory, $isObjectEmpty*/ 12) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$8(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(72:4) {#each $userHabitsHistory as habit}",
    		ctx
    	});

    	return block;
    }

    // (69:33)      Loading...   {:then}
    function create_pending_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Loading...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(69:33)      Loading...   {:then}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let div;
    	let t;
    	let promise;
    	let div_intro;
    	let current;
    	let each_value_1 = /*$userHabitsActive*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*$isDataOutdatedHistory*/ ctx[0], info);

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			info.block.c();
    			attr_dev(div, "class", "pb-2 px-5 space-y-3 sm:w-full sm:max-w-md mt-8 mb-2 sm:mx-auto");
    			add_location(div, file$g, 59, 0, 1363);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t);
    			info.block.m(div, info.anchor = null);
    			info.mount = () => div;
    			info.anchor = null;
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*$userHabitsActive, $isObjectEmpty*/ 6) {
    				each_value_1 = /*$userHabitsActive*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, t);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			info.ctx = ctx;

    			if (dirty & /*$isDataOutdatedHistory*/ 1 && promise !== (promise = /*$isDataOutdatedHistory*/ ctx[0]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(info.block);

    			if (!div_intro) {
    				add_render_callback(() => {
    					div_intro = create_in_transition(div, fade, {});
    					div_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			info.block.d();
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let $API_ENDPOINT;
    	let $userId;
    	let $userProfile;
    	let $isDataOutdatedHistory;
    	let $userHabitsActive;
    	let $isObjectEmpty;
    	let $userHabitsHistory;
    	validate_store(API_ENDPOINT, "API_ENDPOINT");
    	component_subscribe($$self, API_ENDPOINT, $$value => $$invalidate(4, $API_ENDPOINT = $$value));
    	validate_store(userId, "userId");
    	component_subscribe($$self, userId, $$value => $$invalidate(5, $userId = $$value));
    	validate_store(userProfile, "userProfile");
    	component_subscribe($$self, userProfile, $$value => $$invalidate(6, $userProfile = $$value));
    	validate_store(isDataOutdatedHistory, "isDataOutdatedHistory");
    	component_subscribe($$self, isDataOutdatedHistory, $$value => $$invalidate(0, $isDataOutdatedHistory = $$value));
    	validate_store(userHabitsActive, "userHabitsActive");
    	component_subscribe($$self, userHabitsActive, $$value => $$invalidate(1, $userHabitsActive = $$value));
    	validate_store(isObjectEmpty, "isObjectEmpty");
    	component_subscribe($$self, isObjectEmpty, $$value => $$invalidate(2, $isObjectEmpty = $$value));
    	validate_store(userHabitsHistory, "userHabitsHistory");
    	component_subscribe($$self, userHabitsHistory, $$value => $$invalidate(3, $userHabitsHistory = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ScreenHabitHistory", slots, []);
    	let isHistoryLoaded = false;

    	const getHabitHistory = async () => {
    		const fetchURL = $API_ENDPOINT + `/habits/${$userId}/history`;

    		const fetchOptions = {
    			method: "POST",
    			headers: { "content-type": "application/json" },
    			body: JSON.stringify({
    				habitIdsHistory: $userProfile.habitIdsHistory
    			})
    		};

    		const handleErrors = res => {
    			if (!res.ok) {
    				return res.text().then(text => {
    					throw text;
    				});
    			}

    			return res.json();
    		};

    		await fetch(fetchURL, fetchOptions).then(handleErrors).then(res => {
    			console.log("res", res);
    			userHabitsHistory.set(res.userHabitsHistory);
    			isDataOutdatedHistory.set(false);
    			isLSDataOutdated.set(true);
    		}).catch(err => {
    			console.clear();
    			errMessage.set(err);
    			push(`/error`);
    		});
    	};

    	if ($isDataOutdatedHistory) {
    		getHabitHistory();
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$5.warn(`<ScreenHabitHistory> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		userProfile,
    		userHabitsActive,
    		userHabitsHistory,
    		isObjectEmpty,
    		API_ENDPOINT,
    		errMessage,
    		userId,
    		isLSDataOutdated,
    		isDataOutdatedHistory,
    		push,
    		fade,
    		HistoryCard,
    		isHistoryLoaded,
    		getHabitHistory,
    		$API_ENDPOINT,
    		$userId,
    		$userProfile,
    		$isDataOutdatedHistory,
    		$userHabitsActive,
    		$isObjectEmpty,
    		$userHabitsHistory
    	});

    	$$self.$inject_state = $$props => {
    		if ("isHistoryLoaded" in $$props) isHistoryLoaded = $$props.isHistoryLoaded;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$isDataOutdatedHistory, $userHabitsActive, $isObjectEmpty, $userHabitsHistory];
    }

    class ScreenHabitHistory extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScreenHabitHistory",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    var routes = {
    	"/": ScreenHome,

    	"/start": ScreenStart,
    	"/signup": ScreenSignUp,
    	"/about": ScreenAbout,
    	"/error": ScreenError,
    	// "/user/:id": ScreenUser,
    	"/add": ScreenHabitAdd,
    	"/edit": ScreenHabitEdit,
    	"/history": ScreenHabitHistory,
    	"/reflect": ScreenHabitReflect,

    	// Using named parameters, with last being optional
    	// "/author/:first/:last?": Author,
    	// Wildcard parameter
    	// "/book/*": Book,
    	// Catch-all
    	// This is optional, but if present it must be the last
    	// "*": NotFound,
    };

    /* src/App.svelte generated by Svelte v3.32.1 */

    const file$h = "src/App.svelte";

    function create_fragment$j(ctx) {
    	let div;
    	let router;
    	let current;
    	router = new Router({ props: { routes }, $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(router.$$.fragment);
    			attr_dev(div, "class", "bg-repeat h-screen w-screen overflow-x-hidden relative");
    			set_style(div, "background-image", "url(/static/subtle-bg/greek-vase.png)");
    			add_location(div, file$h, 71, 0, 1999);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(router, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(router);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let $getIsLocalStorage;
    	let $isLocalStorage;
    	let $LSisUserDefined;
    	let $LSuserProfile;
    	let $LSuserHabitsActive;
    	let $LSuserHabitsHistory;
    	let $userAuth;
    	let $userProfile;
    	let $userHabitsActive;
    	let $userHabitsHistory;
    	let $isLSDataOutdated;
    	let $isDataOutdatedHistory;
    	validate_store(getIsLocalStorage, "getIsLocalStorage");
    	component_subscribe($$self, getIsLocalStorage, $$value => $$invalidate(2, $getIsLocalStorage = $$value));
    	validate_store(isLocalStorage, "isLocalStorage");
    	component_subscribe($$self, isLocalStorage, $$value => $$invalidate(3, $isLocalStorage = $$value));
    	validate_store(LSisUserDefined, "LSisUserDefined");
    	component_subscribe($$self, LSisUserDefined, $$value => $$invalidate(4, $LSisUserDefined = $$value));
    	validate_store(LSuserProfile, "LSuserProfile");
    	component_subscribe($$self, LSuserProfile, $$value => $$invalidate(5, $LSuserProfile = $$value));
    	validate_store(LSuserHabitsActive, "LSuserHabitsActive");
    	component_subscribe($$self, LSuserHabitsActive, $$value => $$invalidate(6, $LSuserHabitsActive = $$value));
    	validate_store(LSuserHabitsHistory, "LSuserHabitsHistory");
    	component_subscribe($$self, LSuserHabitsHistory, $$value => $$invalidate(7, $LSuserHabitsHistory = $$value));
    	validate_store(userAuth, "userAuth");
    	component_subscribe($$self, userAuth, $$value => $$invalidate(8, $userAuth = $$value));
    	validate_store(userProfile, "userProfile");
    	component_subscribe($$self, userProfile, $$value => $$invalidate(9, $userProfile = $$value));
    	validate_store(userHabitsActive, "userHabitsActive");
    	component_subscribe($$self, userHabitsActive, $$value => $$invalidate(10, $userHabitsActive = $$value));
    	validate_store(userHabitsHistory, "userHabitsHistory");
    	component_subscribe($$self, userHabitsHistory, $$value => $$invalidate(11, $userHabitsHistory = $$value));
    	validate_store(isLSDataOutdated, "isLSDataOutdated");
    	component_subscribe($$self, isLSDataOutdated, $$value => $$invalidate(0, $isLSDataOutdated = $$value));
    	validate_store(isDataOutdatedHistory, "isDataOutdatedHistory");
    	component_subscribe($$self, isDataOutdatedHistory, $$value => $$invalidate(1, $isDataOutdatedHistory = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	isLocalStorage.set($getIsLocalStorage());

    	if ($isLocalStorage && $LSisUserDefined) {
    		userId.set($LSuserProfile.adminIdUser);
    		userProfile.set($LSuserProfile);
    		let activeHabitsClean = $LSuserHabitsActive;

    		while (activeHabitsClean.length < 3) {
    			activeHabitsClean.push(null);
    		}

    		userHabitsActive.set(activeHabitsClean);
    		userHabitsHistory.set($LSuserHabitsHistory);
    		replace("/");
    	} else {
    		replace("/start");
    	}

    	const updateLocalStorage = () => {
    		if ($isLocalStorage) {
    			LSuserAuth.set($userAuth);
    			LSuserProfile.set($userProfile);
    			LSuserHabitsActive.set($userHabitsActive);
    			LSuserHabitsHistory.set($userHabitsHistory);
    			LSisUserDefined.set(true);
    		}

    		$isLSDataOutdated ? isLSDataOutdated.set(false) : "";

    		$isDataOutdatedHistory
    		? isDataOutdatedHistory.set(false)
    		: "";
    	};

    	const updateLSAndRouteHome = () => {
    		updateLocalStorage();
    		replace("/");
    	};

    	// $: console.log("$userId", $userId);
    	// $: console.log("$userProfile", $userProfile);
    	// $: console.log("$userHabitsActive", $userHabitsActive);
    	// $: console.log("$userHabitsHistory", $userHabitsHistory);
    	// $: console.log("$isLSDataOutdated", $isLSDataOutdated);
    	onDestroy(() => {
    		isLSDataOutdated.set(false);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Router,
    		routes,
    		replace,
    		onDestroy,
    		userId,
    		userAuth,
    		userProfile,
    		userHabitsActive,
    		userHabitsHistory,
    		isLSDataOutdated,
    		isDataOutdatedHistory,
    		isLocalStorage,
    		getIsLocalStorage,
    		LSisUserDefined,
    		LSuserAuth,
    		LSuserProfile,
    		LSuserHabitsActive,
    		LSuserHabitsHistory,
    		updateLocalStorage,
    		updateLSAndRouteHome,
    		$getIsLocalStorage,
    		$isLocalStorage,
    		$LSisUserDefined,
    		$LSuserProfile,
    		$LSuserHabitsActive,
    		$LSuserHabitsHistory,
    		$userAuth,
    		$userProfile,
    		$userHabitsActive,
    		$userHabitsHistory,
    		$isLSDataOutdated,
    		$isDataOutdatedHistory
    	});

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$isLSDataOutdated*/ 1) {
    			 $isLSDataOutdated == true ? updateLSAndRouteHome() : "";
    		}

    		if ($$self.$$.dirty & /*$isDataOutdatedHistory*/ 2) {
    			 $isDataOutdatedHistory == true
    			? updateLocalStorage()
    			: "";
    		}
    	};

    	return [$isLSDataOutdated, $isDataOutdatedHistory];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		// name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
