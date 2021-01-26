
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
        const prop_values = options.props || {};
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
            ? instance(component, prop_values, (i, ret, ...rest) => {
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.32.0' }, detail)));
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

    /* node_modules/svelte-spa-router/Router.svelte generated by Svelte v3.32.0 */

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

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
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

    /* src/components/ContentWrapper.svelte generated by Svelte v3.32.0 */
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

    /* src/components/AppHeader.svelte generated by Svelte v3.32.0 */
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
    	{ disabled: false, value: 1, text: `24 hours` },
    	{ disabled: false, value: 3, text: `3 days` },
    	{ disabled: true, value: 7, text: `7 days` },
    	{ disabled: true, value: 21, text: `21 days` },
    	{ disabled: true, value: 100, text: `100 days` },
    	{ disabled: true, value: 365, text: `1 year` },
    ];

    // function to test if local storage is enabled
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

    const getUserProfileBlankFun = () => {
    	return {
    		name: "",
    		email: "",
    		title: "",
    		initials: "",
    		password: "",
    		userScore: 0,
    		isAccountPrivate: true,
    		socialAccounts: {},
    		habitActiveIds: [null, null, null],
    		habitHistoryIds: [],
    		userId: null,
    		podId: null,
    		imageId: null,
    		signUpDate: null,
    	};
    };

    const getUserHabitBlankFun = () => {
    	return {
    		adminActivePosition: null,
    		adminIsActive: null,
    		adminUserId: null,
    		adminHabitId: null,
    		adminSeriesId: null,
    		adminScore: 0,
    		adminIsSuccessful: null,
    		adminUserRating: 0,
    		adminUserReflection: "",
    		detailIsCategory1: false,
    		detailIsCategory2: false,
    		detailIsCategory3: false,
    		detailCode: "",
    		detailDateEndUTCString: "",
    		detailDateStartUTCString: "",
    		detailDuration: 0,
    		detailDescription: "",
    		detailIsNewHabit: true,
    		detailTitle: "",
    		checks: [],
    		messages: [],
    	};
    };

    // content edit
    const contentHabitDetailCategory = readable(
    	contentHabitDetailCategoryData
    );
    const contentHabitDuration = readable(contentHabitDurationData);

    const getIsLocalStorage = readable(isLocalStorageFun);
    const isLocalStorage = writable(null);

    const errMessage = writable(null);
    const API_ENDPOINT = readable(
    	"https://sanderjson-pr-2021-days.builtwithdark.com"
    );

    const activeUserAuthData = {
    	prop1: null,
    	prop2: null,
    	prop3: null,
    };

    const activeUserAuth = writable(activeUserAuthData);
    const isActiveUserLive = writable(false);

    // active...Data is what the app uses -> see App.svelte
    const activeUserDetailsData = getUserProfileBlankFun();
    const activeUserHabitsData = [
    	getUserHabitBlankFun(),
    	getUserHabitBlankFun(),
    	getUserHabitBlankFun(),
    ];

    const getUserProfileBlank = readable(getUserProfileBlankFun);
    const getUserHabitBlank = readable(getUserHabitBlankFun);
    const activeUserDetails = writable(activeUserDetailsData);
    const activeUserHabits = writable(activeUserHabitsData);

    // for iterating over active habits
    const currentActiveHabit = writable(0);
    // flag for social media
    const isNewSocialModal = writable(false);

    const activeUserId = writable(null);

    // adding new habits
    const isNewActiveUserHabit = writable(false);
    const tempUserHabit = writable({});

    /* src/svg/2021.svelte generated by Svelte v3.32.0 */

    const file$2 = "src/svg/2021.svelte";

    function create_fragment$3(ctx) {
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
    			add_location(path0, file$2, 3, 6, 157);
    			attr_dev(path1, "d", "M544.64,2.84V399.11a2.32,2.32,0,0,1-.56,1.7l-15.36,15.35h-.56v.57H288.24l-.57-.57h-.57v-.57l-.57-.57v-398a.5.5,0,0,1,.57-.56v-.57L302.45.57H303A1.65,1.65,0,0,1,304.16,0H543.51V.57h.57a.5.5,0,0,0,.56.57v1.7ZM307,9.1V392.29l8.53-8.53,21.6-21,4-4.55v-315Zm4-3.42,9.66,9.67,5.69,5.12L345.09,39.8H501.44L520.2,20.47l4.55-4.55,1.13-.57,9.67-9.67Zm0,390.58h11.94L357,362.15H345.09l-4,4L318.37,388.3Zm19.9,0h11.94l34.11-34.11H365ZM346.8,63.11V352.49l8.52-8.53,10.81-10.8.56-.57,9.67-9.67,4.55-4.54V83l-7.39-6.82-3.41-4L363.85,66l-4-4-5.68-5.68-4-4-3.41-3.41V63.11ZM357,44.91h-6.25l3.41,3.41Zm93.24,277.45H384.89l-3.41,3.41-9.1,9.09-1.71,1.71-.56.57-12.51,12.5-6.82,6.83h145l-2.84-2.84-18.76-18.77-12.51-12.5Zm-99.49,73.9h11.93l34.12-34.11H384.89ZM376.93,44.91H365L357.6,52.3l2.84,2.28L363.85,58Zm19.9,0H384.89L367.83,62l5.69,6.25ZM370.67,396.26h11.94l34.11-34.11H404.79ZM416.72,44.91H404.79L377.5,72.2l6.25,5.69Zm28.43,55.15H386.59V316.67h58.56Zm-8.53-55.15h-12.5L390,79.59h12.51ZM390,396.26h12.51l34.11-34.11h-12.5ZM456,44.91H444L409.9,79.59h11.94ZM409.9,396.26h11.94L456,362.15H444Zm66-351.35H463.91L429.8,79.59h11.94ZM429.8,396.26h11.94l34.11-34.11H463.91ZM495.75,44.91H483.81L449.7,79.59h11.94L481,60.52l5.11-5.78ZM449.7,396.26h11.94l34.11-34.11H483.81Zm50-347.37L495.18,54l-5.11,4.55-5.69,5.68-9.1,9.1L465.62,83V318.38l18.76,19.33,5.69,5.11,9.66,9.67ZM469.6,396.26h11.94L508.26,369l-5.69-5.68Zm43.78-22.17L512.24,373,489.5,396.26h11.94l17.05-17.05Zm26.15,4V9.1l-5.12,5.11-4.55,4.55-1.14,1.14-4.54,4.55-9.67,9.66-9.09,9.1v315l18.76,18.76,5.68,5.69,9.67,9.67V378.07Zm-11.37,10.8-5.69-5.68L509.4,396.26h11.93Zm.56,7.39h6.83l-3.41-3.41Z");
    			add_location(path1, file$2, 5, 6, 3352);
    			attr_dev(path2, "d", "M830.61,2.84V241.05c0,.39-.38,1-1.13,1.71L815.26,257v.57h-.57v.57H672.56v58.56h58.56V293.93l.57-.57L747,278a.51.51,0,0,0,.57-.57h81.87a.5.5,0,0,0,.56.57.5.5,0,0,0,.57.57v121.1a1.6,1.6,0,0,1-.57,1.13l-15.35,15.35h-.56v.57H574.21v-.57h-1.14v-.57a.51.51,0,0,0-.57-.57V175.11h.57v-.57l15.35-15.35H589v-.57H731.12V100.06H672.56v21.6a1.2,1.2,0,0,1-.28.86,1.13,1.13,0,0,0-.29.85h-.57l-14.78,15.35h-.57v.57H574.21a.5.5,0,0,1-.57-.57h-.57v-.57l-.57-.57V17.05l.57-.56v-.57L588.42.57H589a2.32,2.32,0,0,1,1.7-.57H829.48V.57H830v.57h.57v1.7Zm-203.53,58V43.21L593,9.1V114.84l9.09-8.53,21-21,4-4.55V60.83ZM593,167.71V392.29l9.09-8.53L612.3,373l.57-.56,10.23-9.67,4-4.55V201.83Zm4-162,9.66,9.67H811.85l9.67-9.67Zm15.35,97.79-1.14,1.14L597,118.82h11.94L636.18,92.1l-6.26-6.25-7.39,7.39-.57.57-.57,1.13h-.56l-1.14,1.14ZM597,163.73l9.66,9.67,5.69,5.69,18.76,18.76H781.72L778.88,195,759,175.11l-11.37-11.38H597Zm46,198.42H631.06l-4,4-21,21L597,396.26h11.94ZM787.4,39.8l18.77-19.33H612.3L631.06,39.8Zm-141.56,62-5.68-6.26-23.31,23.31h11.94ZM662.9,362.15H651l-34.11,34.11h11.94Zm4-253.56V83l-1.14-1.13-6.25-5.69-3.42-4L649.82,66l-4-4-5.68-5.68-4-4-3.42-3.41V80.73l18.77,18.76,5.68,5.69,9.67,9.66ZM641.29,344l21-21,4.55-4.54V241.63l-7.39-7.4-3.42-4-6.25-5.68-4-4-5.68-6.25-4-3.42-3.42-3.41v145Zm1.71-299h-6.26l3.42,3.41Zm-6.26,73.91h11.94l7.39-7.39-6.25-5.68ZM643,203.53h-6.26l3.42,3.41Zm27.86,118.83-4,4-10.24,10.23-.57.57-11.93,11.93-7.4,7.4h145l-2.84-2.84L759,333.73l-11.37-11.37H670.86Zm11.93,39.79H670.86l-34.12,34.11h11.94ZM662.9,44.91H651l-6.82,7.39,2.27,2.28L649.82,58Zm0,158.62H651l-6.82,7.39,2.27,2.28,3.41,3.41Zm8-158.62L653.8,62l6.25,6.25,22.74-23.31Zm11.93,158.62H670.86L653.8,220.59l6.25,6.25Zm-26.15-84.71h6.26L660.05,116l-.56-.57Zm46.05,243.33H690.75l-34.11,34.11h11.94Zm0-317.24H690.75L663.46,72.2l6.26,5.69Zm0,158.62H690.75l-27.29,26.72,6.26,6.26ZM676.54,79.59h11.94l34.11-34.68H710.65Zm0,158h11.94l34.11-34.11H710.65Zm46.05,124.51H710.65l-34.11,34.11h11.94ZM730,44.91,695.87,79.59h12.51l34.11-34.68Zm12.51,158.62H730l-34.11,34.11h12.51Zm0,158.62H730l-34.11,34.11h12.51ZM727.71,79.59l34.11-34.68H749.88L715.77,79Zm34.11,123.94H749.88l-34.11,34.11h11.94Zm0,158.62H749.88l-34.11,34.11h11.94ZM747.61,79.59l19.33-19.07,2.27-2.89,2.28-1.74.56-1.15,9.67-9.83H769.78L735.67,79Zm34.11,123.94H769.78l-34.11,34.11h11.94Zm0,158.62H769.78l-34.11,34.11h11.94ZM751.59,159.76l18.76,19.33L776,184.2l9.67,9.67v-145L781.15,54,776,58.56l-.57.57-2.27,2.27-2.84,2.84-9.1,9.1L751.59,83Zm0,126.78v31.84l18.76,19.33,5.68,5.11,9.67,9.67V320.65l-.57-.57-.57-.57-5.11-5.12Zm4-48.9h11.94l27.28-26.72-6.25-6.25Zm0,44.92,9.66,9.66,5.69,5.69,17.62,17.62,17.63-17.62,5.68-5.69,9.67-9.66Zm0,113.7h11.94L794.79,369l-6.25-5.68Zm43.2-181.36-.56-.56-22.75,23.3H787.4l17.06-17Zm0,158.62-.56-.57-22.75,23.31H787.4l17.06-17.05ZM825.5,219.45V9.1l-5.12,5.11-4.55,4.55-1.14,1.14-4.54,4.55-9.67,9.66-9.1,9.1V199.55l18.77,18.76,5.68,5.69,9.67,9.66V219.45Zm0,158.62V286.54l-5.12,5.11-4.55,4.55-.57.57-.57.57-4.54,4.55-9.67,9.66-9.1,9.1v37.52l18.77,18.76,5.68,5.69,9.67,9.67V378.07ZM814.13,230.25l-5.69-5.68-13.08,13.07H807.3Zm0,158.62-5.69-5.68-13.08,13.07H807.3Zm1.7-151.23h5.69l-2.85-2.84-.57-.57-3.41,3.41Zm0,158.62h5.69l-2.85-2.84-.57-.57-3.41,3.41Z");
    			add_location(path2, file$2, 7, 6, 5009);
    			attr_dev(path3, "d", "M998.32,2.27v398a.51.51,0,0,0-.57.57l-13.07,14.78a3.26,3.26,0,0,1-2.28,1.14H900.54a.5.5,0,0,1-.57-.57h-.57a.51.51,0,0,0-.57-.57V100.06h-37a.5.5,0,0,1-.57-.57h-1.14l-.57-.57v-.56H859V17.05a.5.5,0,0,1,.57-.56v-.57L875,.57h.57A1.66,1.66,0,0,1,876.66,0h120a.51.51,0,0,1,.57.57h.56a.5.5,0,0,0,.57.57V2.27ZM879.5,9.1V75l18.19-17.62,1.71-1.71v-.56l7.39-7.39,5.68-5.69-10.8-10.8Zm4-3.42,9.66,9.67,5.69,5.12L917.59,39.8h37.52l18.77-19.33,4.54-4.55,1.14-.57,9.67-9.67ZM895.42,79l34.11-34.12H917.59l-4,4-8,8.53-2.27,1.71-12.51,12.5L883.48,79Zm19.9,0,18.76-18.77,5.68-5.68,9.67-9.67H937.49L903.38,79ZM929,73.34,919.3,83V392.29l8.53-8.53L938.63,373l.57-.56,9.66-9.67,4.55-4.55V48.89L948.29,54l-4.55,4.55-5.68,5.68Zm-5.68,322.92h11.94L961.94,369l-5.69-5.68-5.12,5.12-7.39,6.82-.56,1.14L942,377.5l-1.14.57Zm19.9,0h11.93l17.06-17.05L965.92,373Zm25-362.15-9.1,9.1v315l18.77,18.76,5.68,5.69,9.67,9.67V9.1l-5.12,5.11-4.55,4.55L982.4,19.9l-4.54,4.55ZM962.5,396.26h26.73l-2.85-2.84-10.23-10.23Z");
    			add_location(path3, file$2, 9, 6, 8239);
    			attr_dev(g0, "id", "Layer_1-2");
    			attr_dev(g0, "data-name", "Layer 1");
    			add_location(g0, file$2, 2, 4, 112);
    			attr_dev(g1, "id", "Layer_2");
    			attr_dev(g1, "data-name", "Layer 2");
    			add_location(g1, file$2, 1, 2, 71);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 998.32 416.73");
    			add_location(svg, file$2, 0, 0, 0);
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
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
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_2021",
    			options,
    			id: create_fragment$3.name
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

    const LSuserDetailsData = {
    	name: "",
    	habit: "",
    	habitType: null,
    	habitCategory: [],
    	habitDateStartUTCString: "",
    	habitDateEndUTCString: "",
    };

    const LSactiveHabitsData = [
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

    const LSisUserDefined = writable$1("isUserDefined", false);
    const LSuserAuth = writable$1("userAuth", LSuserAuthData);
    const LSuserDetails = writable$1("userDetails", LSuserDetailsData);
    const LSactiveHabits = writable$1("activeHabits", LSactiveHabitsData);

    /* src/routes/ScreenStart.svelte generated by Svelte v3.32.0 */

    const { console: console_1$1 } = globals;

    const file$3 = "src/routes/ScreenStart.svelte";

    // (100:0) <AppHeader>
    function create_default_slot_1(ctx) {
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
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(100:0) <AppHeader>",
    		ctx
    	});

    	return block;
    }

    // (104:0) <ContentWrapper>
    function create_default_slot(ctx) {
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
    			add_location(label0, file$3, 106, 6, 2780);
    			attr_dev(input0, "id", "email");
    			attr_dev(input0, "name", "email");
    			attr_dev(input0, "type", "email");
    			attr_dev(input0, "autocomplete", "email");
    			input0.required = true;
    			attr_dev(input0, "class", "appearance-none block w-full px-3 py-2 border border-gray-300\n          rounded-md shadow-sm placeholder-gray-400 focus:outline-none\n          focus:ring-blue-500 focus:border-blue-500 sm:text-sm");
    			add_location(input0, file$3, 110, 8, 2918);
    			attr_dev(div0, "class", "mt-1");
    			add_location(div0, file$3, 109, 6, 2891);
    			add_location(div1, file$3, 105, 4, 2768);
    			attr_dev(label1, "for", "password");
    			attr_dev(label1, "class", "block text-sm font-medium text-gray-700");
    			add_location(label1, file$3, 124, 6, 3338);
    			attr_dev(input1, "id", "password");
    			attr_dev(input1, "name", "password");
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "autocomplete", "password");
    			input1.required = true;
    			attr_dev(input1, "class", "appearance-none block w-full px-3 py-2 border border-gray-300\n          rounded-md shadow-sm placeholder-gray-400 focus:outline-none\n          focus:ring-blue-500 focus:border-blue-500 sm:text-sm");
    			add_location(input1, file$3, 128, 8, 3474);
    			attr_dev(div2, "class", "mt-1");
    			add_location(div2, file$3, 127, 6, 3447);
    			add_location(div3, file$3, 123, 4, 3326);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "w-full flex justify-center py-2 px-4 border border-transparent\n        rounded-md shadow-sm text-sm font-medium text-white bg-blue-600\n        hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2\n        focus:ring-blue-500");
    			add_location(button, file$3, 142, 6, 3909);
    			add_location(div4, file$3, 141, 4, 3897);
    			attr_dev(form, "class", "space-y-6");
    			add_location(form, file$3, 104, 2, 2699);
    			attr_dev(div5, "class", "w-full border-t border-gray-300");
    			add_location(div5, file$3, 156, 8, 4362);
    			attr_dev(div6, "class", "absolute inset-0 flex items-center");
    			add_location(div6, file$3, 155, 6, 4305);
    			attr_dev(span0, "class", "px-2 bg-white text-gray-500");
    			add_location(span0, file$3, 159, 8, 4488);
    			attr_dev(div7, "class", "relative flex justify-center text-sm");
    			add_location(div7, file$3, 158, 6, 4429);
    			attr_dev(div8, "class", "relative");
    			add_location(div8, file$3, 154, 4, 4276);
    			attr_dev(span1, "class", "");
    			add_location(span1, file$3, 170, 10, 4857);
    			attr_dev(a0, "href", "#/signup");
    			attr_dev(a0, "class", "w-full inline-flex justify-center py-2 px-4 border\n          border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium\n          text-gray-500 hover:bg-gray-50");
    			add_location(a0, file$3, 165, 8, 4631);
    			add_location(div9, file$3, 164, 6, 4617);
    			attr_dev(span2, "class", "");
    			add_location(span2, file$3, 180, 10, 5159);
    			attr_dev(a1, "href", "#/about");
    			attr_dev(a1, "class", "w-full inline-flex justify-center py-2 px-4 border\n          border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium\n          text-gray-500 hover:bg-gray-50");
    			add_location(a1, file$3, 175, 8, 4934);
    			add_location(div10, file$3, 174, 6, 4920);
    			attr_dev(div11, "class", "mt-6 grid grid-cols-2 gap-3");
    			add_location(div11, file$3, 163, 4, 4569);
    			attr_dev(div12, "class", "mt-6");
    			add_location(div12, file$3, 153, 2, 4253);
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
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(104:0) <ContentWrapper>",
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

    			if (dirty & /*$$scope*/ 256) {
    				appheader_changes.$$scope = { dirty, ctx };
    			}

    			appheader.$set(appheader_changes);
    			const contentwrapper_changes = {};

    			if (dirty & /*$$scope, userTemp*/ 257) {
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
    	let $API_ENDPOINT;
    	let $getUserHabitBlank;
    	let $activeUserHabits;
    	let $isLocalStorage;
    	validate_store(API_ENDPOINT, "API_ENDPOINT");
    	component_subscribe($$self, API_ENDPOINT, $$value => $$invalidate(4, $API_ENDPOINT = $$value));
    	validate_store(getUserHabitBlank, "getUserHabitBlank");
    	component_subscribe($$self, getUserHabitBlank, $$value => $$invalidate(5, $getUserHabitBlank = $$value));
    	validate_store(activeUserHabits, "activeUserHabits");
    	component_subscribe($$self, activeUserHabits, $$value => $$invalidate(6, $activeUserHabits = $$value));
    	validate_store(isLocalStorage, "isLocalStorage");
    	component_subscribe($$self, isLocalStorage, $$value => $$invalidate(7, $isLocalStorage = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ScreenStart", slots, []);
    	let userTemp = { email: "", password: "" };

    	const handleSignIn = async () => {
    		const fetchURL = $API_ENDPOINT + "/signInUser";

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
    			let activeHabitsClean = res.userActiveHabits.map(habit => {
    				if (habit === null) {
    					return $getUserHabitBlank();
    				} else {
    					return habit;
    				}
    			});

    			while (activeHabitsClean.length < 3) {
    				activeHabitsClean.push($getUserHabitBlank());
    			}

    			activeUserAuth.set(res.userAuth);
    			activeUserDetails.set(res.userDetails);
    			activeUserId.set(res.userDetails.userId);
    			activeUserHabits.set(activeHabitsClean);
    			console.log("$activeUserHabits", $activeUserHabits);
    			isActiveUserLive.set(true);
    		}).catch(err => {
    			console.clear();
    			errMessage.set(err);
    			push(`/error`);
    		});
    	};

    	onMount(() => {
    		// clean all local storage on start screen
    		if ($isLocalStorage) {
    			LSuserAuth.set(null);
    			LSuserDetails.set(null);
    			LSactiveHabits.set([null, null, null]);
    			LSisUserDefined.set(false);
    		}
    	}); // already set to the initial values
    	// console.log("$activeUserAuth", $activeUserAuth);
    	// console.log("$activeUserId", $activeUserId);
    	// console.log("$activeUserDetails", $activeUserDetails);

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<ScreenStart> was created with unknown prop '${key}'`);
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
    		activeUserAuth,
    		activeUserId,
    		activeUserDetails,
    		activeUserHabits,
    		isActiveUserLive,
    		LSisUserDefined,
    		LSuserAuth,
    		LSuserDetails,
    		LSactiveHabits,
    		userTemp,
    		handleSignIn,
    		$API_ENDPOINT,
    		$getUserHabitBlank,
    		$activeUserHabits,
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScreenStart",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/routes/ScreenSignUp.svelte generated by Svelte v3.32.0 */

    const { console: console_1$2 } = globals;

    const file$4 = "src/routes/ScreenSignUp.svelte";

    // (86:0) <AppHeader>
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
    		source: "(86:0) <AppHeader>",
    		ctx
    	});

    	return block;
    }

    // (90:0) <ContentWrapper>
    function create_default_slot$1(ctx) {
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
    			add_location(label0, file$4, 92, 6, 2536);
    			attr_dev(input0, "id", "name");
    			attr_dev(input0, "name", "name");
    			attr_dev(input0, "type", "name");
    			attr_dev(input0, "autocomplete", "name");
    			input0.required = true;
    			attr_dev(input0, "placeholder", "Jane Doe");
    			attr_dev(input0, "class", "appearance-none block w-full px-3 py-2 border border-gray-300\n          rounded-md shadow-sm placeholder-gray-400 focus:outline-none\n          focus:ring-blue-500 focus:border-blue-500 sm:text-sm");
    			add_location(input0, file$4, 96, 8, 2664);
    			attr_dev(div0, "class", "mt-1");
    			add_location(div0, file$4, 95, 6, 2637);
    			add_location(div1, file$4, 91, 4, 2524);
    			attr_dev(label1, "for", "initials");
    			attr_dev(label1, "class", "block text-sm font-medium text-gray-700");
    			add_location(label1, file$4, 111, 6, 3119);
    			attr_dev(input1, "id", "initials");
    			attr_dev(input1, "name", "initials");
    			attr_dev(input1, "type", "initials");
    			attr_dev(input1, "autocomplete", "initials");
    			input1.required = true;
    			attr_dev(input1, "placeholder", "JD");
    			attr_dev(input1, "class", "appearance-none block w-full px-3 py-2 border border-gray-300\n          rounded-md shadow-sm placeholder-gray-400 focus:outline-none\n          focus:ring-blue-500 focus:border-blue-500 sm:text-sm");
    			add_location(input1, file$4, 115, 8, 3255);
    			attr_dev(div2, "class", "mt-1");
    			add_location(div2, file$4, 114, 6, 3228);
    			add_location(div3, file$4, 110, 4, 3107);
    			attr_dev(label2, "for", "title");
    			attr_dev(label2, "class", "block text-sm font-medium text-gray-700");
    			add_location(label2, file$4, 130, 6, 3724);
    			attr_dev(input2, "id", "title");
    			attr_dev(input2, "name", "title");
    			attr_dev(input2, "type", "title");
    			attr_dev(input2, "autocomplete", "title");
    			input2.required = true;
    			attr_dev(input2, "placeholder", "Guardian of the Galaxy");
    			attr_dev(input2, "class", "appearance-none block w-full px-3 py-2 border border-gray-300\n          rounded-md shadow-sm placeholder-gray-400 focus:outline-none\n          focus:ring-blue-500 focus:border-blue-500 sm:text-sm");
    			add_location(input2, file$4, 134, 8, 3854);
    			attr_dev(div4, "class", "mt-1");
    			add_location(div4, file$4, 133, 6, 3827);
    			add_location(div5, file$4, 129, 4, 3712);
    			attr_dev(label3, "for", "email");
    			attr_dev(label3, "class", "block text-sm font-medium text-gray-700");
    			add_location(label3, file$4, 149, 6, 4328);
    			attr_dev(input3, "id", "email");
    			attr_dev(input3, "name", "email");
    			attr_dev(input3, "type", "email");
    			attr_dev(input3, "autocomplete", "email");
    			input3.required = true;
    			attr_dev(input3, "placeholder", "janedoe@domain.com");
    			attr_dev(input3, "class", "appearance-none block w-full px-3 py-2 border border-gray-300\n          rounded-md shadow-sm placeholder-gray-400 focus:outline-none\n          focus:ring-blue-500 focus:border-blue-500 sm:text-sm");
    			add_location(input3, file$4, 153, 8, 4458);
    			attr_dev(div6, "class", "mt-1");
    			add_location(div6, file$4, 152, 6, 4431);
    			add_location(div7, file$4, 148, 4, 4316);
    			attr_dev(label4, "for", "password");
    			attr_dev(label4, "class", "block text-sm font-medium text-gray-700");
    			add_location(label4, file$4, 168, 6, 4928);
    			attr_dev(input4, "id", "password");
    			attr_dev(input4, "name", "password");
    			attr_dev(input4, "type", "password");
    			attr_dev(input4, "autocomplete", "password");
    			input4.required = true;
    			attr_dev(input4, "placeholder", "*****");
    			attr_dev(input4, "class", "appearance-none block w-full px-3 py-2 border border-gray-300\n          rounded-md shadow-sm placeholder-gray-400 focus:outline-none\n          focus:ring-blue-500 focus:border-blue-500 sm:text-sm");
    			add_location(input4, file$4, 172, 8, 5064);
    			attr_dev(div8, "class", "mt-1");
    			add_location(div8, file$4, 171, 6, 5037);
    			add_location(div9, file$4, 167, 4, 4916);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "w-full flex justify-center py-2 px-4 border border-transparent\n        rounded-md shadow-sm text-sm font-bold text-white bg-blue-900\n        hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2\n        focus:ring-blue-500");
    			add_location(button, file$4, 187, 6, 5536);
    			add_location(div10, file$4, 186, 4, 5524);
    			attr_dev(form, "class", "space-y-6");
    			add_location(form, file$4, 90, 2, 2455);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div1);
    			append_dev(div1, label0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, input0);
    			set_input_value(input0, /*userProfileTemp*/ ctx[0].name);
    			append_dev(form, t2);
    			append_dev(form, div3);
    			append_dev(div3, label1);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, input1);
    			set_input_value(input1, /*userProfileTemp*/ ctx[0].initials);
    			append_dev(form, t5);
    			append_dev(form, div5);
    			append_dev(div5, label2);
    			append_dev(div5, t7);
    			append_dev(div5, div4);
    			append_dev(div4, input2);
    			set_input_value(input2, /*userProfileTemp*/ ctx[0].title);
    			append_dev(form, t8);
    			append_dev(form, div7);
    			append_dev(div7, label3);
    			append_dev(div7, t10);
    			append_dev(div7, div6);
    			append_dev(div6, input3);
    			set_input_value(input3, /*userProfileTemp*/ ctx[0].email);
    			append_dev(form, t11);
    			append_dev(form, div9);
    			append_dev(div9, label4);
    			append_dev(div9, t13);
    			append_dev(div9, div8);
    			append_dev(div8, input4);
    			set_input_value(input4, /*userProfileTemp*/ ctx[0].password);
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
    			if (dirty & /*userProfileTemp*/ 1) {
    				set_input_value(input0, /*userProfileTemp*/ ctx[0].name);
    			}

    			if (dirty & /*userProfileTemp*/ 1) {
    				set_input_value(input1, /*userProfileTemp*/ ctx[0].initials);
    			}

    			if (dirty & /*userProfileTemp*/ 1) {
    				set_input_value(input2, /*userProfileTemp*/ ctx[0].title);
    			}

    			if (dirty & /*userProfileTemp*/ 1 && input3.value !== /*userProfileTemp*/ ctx[0].email) {
    				set_input_value(input3, /*userProfileTemp*/ ctx[0].email);
    			}

    			if (dirty & /*userProfileTemp*/ 1 && input4.value !== /*userProfileTemp*/ ctx[0].password) {
    				set_input_value(input4, /*userProfileTemp*/ ctx[0].password);
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
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(90:0) <ContentWrapper>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
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

    			if (dirty & /*$$scope*/ 1024) {
    				appheader_changes.$$scope = { dirty, ctx };
    			}

    			appheader.$set(appheader_changes);
    			const contentwrapper_changes = {};

    			if (dirty & /*$$scope, userProfileTemp*/ 1025) {
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $getUserProfileBlank;
    	let $API_ENDPOINT;
    	let $getUserHabitBlank;
    	validate_store(getUserProfileBlank, "getUserProfileBlank");
    	component_subscribe($$self, getUserProfileBlank, $$value => $$invalidate(7, $getUserProfileBlank = $$value));
    	validate_store(API_ENDPOINT, "API_ENDPOINT");
    	component_subscribe($$self, API_ENDPOINT, $$value => $$invalidate(8, $API_ENDPOINT = $$value));
    	validate_store(getUserHabitBlank, "getUserHabitBlank");
    	component_subscribe($$self, getUserHabitBlank, $$value => $$invalidate(9, $getUserHabitBlank = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ScreenSignUp", slots, []);
    	const userProfileTemp = $getUserProfileBlank();

    	const handleSignUp = async () => {
    		const fetchURL = $API_ENDPOINT + "/createNewUser";

    		const fetchOptions = {
    			method: "POST",
    			headers: { "content-type": "application/json" },
    			body: JSON.stringify({
    				name: userProfileTemp.name,
    				email: userProfileTemp.email.toLocaleLowerCase(),
    				title: userProfileTemp.title,
    				initials: userProfileTemp.initials,
    				password: userProfileTemp.password,
    				userScore: userProfileTemp.userScore,
    				isAccountPrivate: userProfileTemp.isAccountPrivate,
    				socialAccounts: userProfileTemp.socialAccounts,
    				habitActiveIds: userProfileTemp.habitActiveIds,
    				habitHistoryIds: userProfileTemp.habitHistoryIds,
    				userId: userProfileTemp.userId,
    				podId: userProfileTemp.podId,
    				imageId: userProfileTemp.imageId,
    				signUpDate: userProfileTemp.signUpDate
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
    			let activeHabitsClean = res.userActiveHabits.map(habit => {
    				if (habit == null) {
    					return $getUserHabitBlank();
    				}

    				return habit;
    			});

    			activeUserAuth.set(res.userAuth);
    			activeUserDetails.set(res.userDetails);
    			activeUserId.set(res.userDetails.userId);
    			activeUserHabits.set(activeHabitsClean);
    			isActiveUserLive.set(true);
    		}).catch(err => {
    			console.clear();
    			errMessage.set(err);
    			push(`/error`);
    		});
    	};

    	onMount(() => {
    		$$invalidate(0, userProfileTemp.signUpDate = new Date(), userProfileTemp);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<ScreenSignUp> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		userProfileTemp.name = this.value;
    		$$invalidate(0, userProfileTemp);
    	}

    	function input1_input_handler() {
    		userProfileTemp.initials = this.value;
    		$$invalidate(0, userProfileTemp);
    	}

    	function input2_input_handler() {
    		userProfileTemp.title = this.value;
    		$$invalidate(0, userProfileTemp);
    	}

    	function input3_input_handler() {
    		userProfileTemp.email = this.value;
    		$$invalidate(0, userProfileTemp);
    	}

    	function input4_input_handler() {
    		userProfileTemp.password = this.value;
    		$$invalidate(0, userProfileTemp);
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
    		getUserProfileBlank,
    		getUserHabitBlank,
    		activeUserAuth,
    		activeUserId,
    		activeUserDetails,
    		activeUserHabits,
    		isActiveUserLive,
    		userProfileTemp,
    		handleSignUp,
    		$getUserProfileBlank,
    		$API_ENDPOINT,
    		$getUserHabitBlank
    	});

    	return [
    		userProfileTemp,
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
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScreenSignUp",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/routes/ScreenAbout.svelte generated by Svelte v3.32.0 */
    const file$5 = "src/routes/ScreenAbout.svelte";

    // (7:0) <AppHeader>
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
    		source: "(7:0) <AppHeader>",
    		ctx
    	});

    	return block;
    }

    // (11:0) <ContentWrapper>
    function create_default_slot$2(ctx) {
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
    		id: create_default_slot$2.name,
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

    /* src/svg/error.svelte generated by Svelte v3.32.0 */

    const { Error: Error_1$1 } = globals;
    const file$6 = "src/svg/error.svelte";

    function create_fragment$7(ctx) {
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
    			add_location(path0, file$6, 0, 143, 143);
    			attr_dev(path1, "d", "M542.94,0c1.51,0,2.27,1,2.27,2.84v158a3.3,3.3,0,0,1-.57,2.28l-19.89,19.9-17.63,17.62,37.52,37.52a3.3,3.3,0,0,1,.57,2.28V400.24l-.57.57-19.78,14.78v.57h-.57v.57H448.54a2.5,2.5,0,0,1-2.82-2.84V262.66H387.16V398.54a2.32,2.32,0,0,1-.28,1.42,1.13,1.13,0,0,0-.29.85l-19.9,14.78a3.22,3.22,0,0,1-2.27,1.14H289.94a2.5,2.5,0,0,1-2.84-2.84V16.49a3.26,3.26,0,0,1,1.14-2.28L301.88,2.27a1.14,1.14,0,0,1,.29-.85,1.19,1.19,0,0,0,.28-.85,2.44,2.44,0,0,0,1.14-.29A2.58,2.58,0,0,1,304.72,0H542.94ZM307.57,10.23V391.71l34.11-33.54V43.78Zm4-4.55L326.33,19.9l5.12,5.68L345.66,39.8H501.44L535.55,5.68Zm.57,390.58h11.37l26.72-26.72-5.69-5.68-15.35,15.35-4,4Zm18.76,0h11.94l17.05-17.05-5.68-5.69Zm23.31-340-4-4-2.85-2.84V193.3l33.55-33.54V83l-6.83-6.82-4-4L363.85,66l-4-4Zm26.72,309.28V241.62l-6.83-7.39-4-4-6.26-5.68-4-4-5.68-6.26-4-4-2.85-2.27V358.17l14.22,14.22,5.68,5.11,13.65,14.21V365.56Zm-30.13,30.7h11.93l7.4-6.82-6.26-6.25ZM357.6,44.91h-6.26l2.85,3.41Zm99.56,152.94h38.69l-34.14-34.11H385.48L371.26,178l-5.69,5.68-14.23,14.22Zm-99.56,5.68h-6.26l2.85,2.85ZM376.93,44.91H365l-6.82,6.83L364.42,58Zm0,158.62H365l-6.82,6.82,6.25,6.26Zm19.9-158.62H384.89L368.4,62l2.84,2.84,2.84,2.84ZM374.08,226.27l22.75-22.74H384.89L368.4,220l2.84,3.41Zm-3.41,170h6.26l-2.85-2.84ZM416.72,44.91H404.79L378.07,71.63l6.25,6.26Zm0,158.62H404.79l-26.72,26.72,6.25,5.69Zm28.43-98.92h-58v54h58Zm-8.53-59.7H424.68L390.57,79h11.94ZM390.57,237.64h11.94l34.11-34.11H424.68ZM456.52,44.91H444.58L410.47,79h11.94ZM444.58,203.53l-34.11,34.11h11.94l34.11-34.11ZM476.7,44.91H464.12L429.8,79h12.58ZM429.8,237.64h12.58l34.32-34.11H464.12ZM495.85,44.91h-12L449.7,79h12ZM449.7,237.64h12l34.18-34.11h-12Zm50-188.18L495.18,54l-9.1,9.1-.56,1.13-5.12,4.55L466.19,83v76.76l14.24,14.78,5.69,5.11,9.12,9.1,4.55,4.55ZM466.19,391.71l33.54-33.54V208.08l-12.51,12.51-1.14,1.14-.56.56L483.81,224l-.57.57-2.84,2.84-14.21,14.21Zm4.31,4.55h11.38l27.28-26.72-5.68-5.68L490.4,376.37l-2.84,2.84-.57.57-3.41,3.41-4,4Zm19.15,0h11.94l17.05-17.05-6.25-5.69Zm49.88-386L525.88,23.88l-1.13.57L520.2,29l-5.12,5.69-9.1,9.1V193.3l33.55-33.54Zm0,355.33V241.62L506,208.08V358.17l14.22,14.22,5.68,5.11,13.65,14.21V365.56Zm-30.14,30.7h11.94l6.83-6.82-5.69-6.25Zm19.9,0h6.26l-3.41-2.84Z");
    			add_location(path1, file$6, 0, 2855, 2855);
    			attr_dev(path2, "d", "M829.48,0c1.51,0,2.27,1,2.27,2.84v158a3.35,3.35,0,0,1-.57,2.28l-19.9,19.9-17.62,17.62,37.52,37.52a3.35,3.35,0,0,1,.57,2.28V400.24l-.57.57L811.4,415.59v.57h-.57v.57H735.08a2.5,2.5,0,0,1-2.82-2.84V262.66H673.7V398.54a2.23,2.23,0,0,1-.29,1.42,1.16,1.16,0,0,0-.28.85l-19.9,14.78a3.24,3.24,0,0,1-2.27,1.14H576.48a2.5,2.5,0,0,1-2.84-2.84V16.49a3.29,3.29,0,0,1,1.13-2.28L588.42,2.27a1.18,1.18,0,0,1,.28-.85A1.15,1.15,0,0,0,589,.57a2.47,2.47,0,0,0,1.14-.29A2.58,2.58,0,0,1,591.26,0H829.48ZM594.1,10.23V391.71l34.12-33.54V43.78Zm4-4.55L612.87,19.9,618,25.58,632.2,39.8H788L822.08,5.68Zm.57,390.58H610l26.72-26.72-5.68-5.68-15.35,15.35-4,4Zm18.76,0h11.94l17.06-17.05-5.69-5.69Zm23.31-340-4-4-2.84-2.84V193.3l33.54-33.54V83l-6.82-6.82-4-4L650.39,66l-4-4Zm26.72,309.28V241.62l-6.82-7.39-4-4-6.25-5.68-4-4-5.69-6.26-4-4-2.84-2.27V358.17l14.22,14.22,5.68,5.11,13.64,14.21V365.56Zm-30.13,30.7h11.94l7.39-6.82-6.25-6.25Zm6.82-351.35h-6.25l2.84,3.41ZM743.7,197.85h38.68l-34.13-34.11H672L657.8,178l-5.7,5.68-14.22,14.22Zm-99.57,5.68h-6.25l2.84,2.85ZM663.46,44.91H651.53l-6.83,6.83L651,58Zm0,158.62H651.53l-6.83,6.82,6.26,6.26Zm19.9-158.62H671.42L654.94,62l2.84,2.84,2.84,2.84ZM660.62,226.27l22.74-22.74H671.42L654.94,220l2.84,3.41Zm-3.41,170h6.25l-2.84-2.84Zm46-351.35H691.32L664.6,71.63l6.26,6.26Zm0,158.62H691.32L664.6,230.25l6.26,5.69Zm28.43-98.92h-58v54h58Zm-8.53-59.7H711.22L677.11,79h11.94Zm-46,192.73h11.94l34.11-34.11H711.22ZM743.06,44.91H731.12L697,79H709ZM731.12,203.53,697,237.64H709l34.11-34.11ZM763.23,44.91H750.65L716.34,79h12.58ZM716.34,237.64h12.58l34.31-34.11H750.65Zm66-192.73h-12L736.24,79h12ZM736.24,237.64h12l34.18-34.11h-12Zm50-188.18L781.72,54l-9.1,9.1-.57,1.13-5.11,4.55L752.72,83v76.76L767,174.54l5.7,5.11,9.11,9.1,4.56,4.55ZM752.72,391.71l33.55-33.54V208.08l-12.51,12.51-1.14,1.14-.57.56-1.7,1.71-.57.57-2.84,2.84-14.22,14.21Zm4.32,4.55h11.37l27.29-26.72L790,363.86l-13.08,12.51-2.84,2.84-.57.57-3.41,3.41-4,4Zm19.14,0h11.94l17.06-17.05-6.25-5.69Zm49.88-386L812.42,23.88l-1.14.57L806.73,29l-5.11,5.69-9.1,9.1V193.3l33.54-33.54Zm0,355.33V241.62l-33.54-33.54V358.17l14.21,14.22,5.69,5.11,13.64,14.21V365.56Zm-30.13,30.7h11.94l6.82-6.82L809,383.19Zm19.9,0h6.25l-3.41-2.84Z");
    			add_location(path2, file$6, 0, 5062, 5062);
    			attr_dev(path3, "d", "M1118.29,2.84V399.11a2.32,2.32,0,0,1-.57,1.7l-15.35,15.35h-.57v.57H861.88l-.57-.57h-.57v-.57l-.57-.57v-398a.5.5,0,0,1,.57-.57v-.57L876.09.57h.57A1.66,1.66,0,0,1,877.8,0h239.35V.57h.57a.5.5,0,0,0,.57.57v1.7ZM880.64,9.1V392.28l8.53-8.52,21.6-21,4-4.55v-315Zm4-3.42,9.67,9.67L900,20.47,918.73,39.8h156.35l18.76-19.33,4.55-4.55,1.13-.57,9.67-9.67Zm0,390.58h11.94l34.11-34.11H918.73l-4,4L892,388.3Zm19.9,0h11.94l34.11-34.11H938.63ZM920.44,63.11V352.49L929,344l10.8-10.8.57-.57,9.66-9.67,4.55-4.54V83l-7.39-6.82-3.41-4L937.49,66l-4-4-5.68-5.69-4-4-3.41-3.41V63.11Zm10.23-18.2h-6.25l3.41,3.41Zm93.24,277.44H958.53l-3.41,3.42-9.1,9.09-1.7,1.71-.57.57-12.51,12.5-6.82,6.83h145l-2.84-2.85-18.76-18.76-12.51-12.51Zm-99.49,73.91h11.94l34.11-34.11H958.53ZM950.57,44.91H938.63l-7.39,7.39,2.84,2.28L937.49,58Zm19.9,0H958.53L941.47,62l5.69,6.25ZM944.32,396.26h11.93l34.12-34.11H978.43Zm46-351.35H978.43L951.14,72.2l6.25,5.69Zm28.42,55.15H960.23V316.67h58.56Zm-8.52-55.15H997.76L963.65,79.59h12.5ZM963.65,396.26h12.5l34.12-34.11H997.76Zm65.94-351.35h-11.93L983.54,79.59h11.94Zm-46,351.35h11.94l34.11-34.11h-11.93Zm66-351.35h-11.94l-34.11,34.68h11.94Zm-46,351.35h11.94l34.11-34.11h-11.94Zm66-351.35h-11.94l-34.11,34.68h11.94l19.33-19.07,5.12-5.78Zm-46.05,351.35h11.94l34.11-34.11h-11.94Zm50-347.37L1068.82,54l-5.11,4.55L1058,64.24l-9.1,9.1L1039.26,83V318.38L1058,337.71l5.69,5.11,9.66,9.67Zm-30.13,347.37h11.94L1081.9,369l-5.69-5.68ZM1087,374.09l-1.14-1.14-22.74,23.31h11.94l17.05-17.05Zm26.15,4V9.1l-5.12,5.11-4.55,4.55-1.13,1.14-4.55,4.55-9.67,9.66-9.09,9.1v315l18.76,18.76,5.68,5.69,9.67,9.66V378.07Zm-11.37,10.8-5.69-5.68L1083,396.26H1095Zm.57,7.39h6.82l-3.41-3.41Z");
    			add_location(path3, file$6, 0, 7251, 7251);
    			attr_dev(path4, "d", "M1402.55,0c1.51,0,2.27,1,2.27,2.84v158a3.3,3.3,0,0,1-.57,2.28l-19.89,19.9-17.63,17.62,37.52,37.52a3.3,3.3,0,0,1,.57,2.28V400.24l-.57.57-19.78,14.78v.57h-.57v.57h-75.74a2.5,2.5,0,0,1-2.83-2.84V262.66h-58.56V398.54a2.32,2.32,0,0,1-.28,1.42,1.13,1.13,0,0,0-.29.85l-19.9,14.78a3.22,3.22,0,0,1-2.27,1.14h-74.48a2.5,2.5,0,0,1-2.84-2.84V16.49a3.26,3.26,0,0,1,1.14-2.28l13.64-11.94a1.14,1.14,0,0,1,.29-.85,1.19,1.19,0,0,0,.28-.85,2.44,2.44,0,0,0,1.14-.29,2.58,2.58,0,0,1,1.13-.28h238.22ZM1167.18,10.23V391.71l34.11-33.54V43.78Zm4-4.55,14.78,14.22,5.12,5.68,14.21,14.22h155.78l34.11-34.12Zm.57,390.58h11.37l26.72-26.72-5.69-5.68-15.35,15.35-4,4Zm18.76,0h11.94l17-17.05-5.68-5.69Zm23.31-340-4-4L1207,49.46V193.3l33.55-33.54V83l-6.82-6.82-4-4L1223.46,66l-4-4Zm26.72,309.28V241.62l-6.82-7.39-4-4-6.26-5.68-4-4-5.68-6.26-4-4-2.85-2.27V358.17l14.22,14.22,5.68,5.11,13.65,14.21V365.56Zm-30.13,30.7h11.94l7.39-6.82-6.26-6.25Zm6.82-351.35H1211l2.85,3.41Zm99.56,152.94h38.69l-34.14-34.11h-76.23L1230.87,178l-5.69,5.68L1211,197.85Zm-99.56,5.68H1211l2.85,2.85Zm19.33-158.62H1224.6l-6.82,6.83L1224,58Zm0,158.62H1224.6l-6.82,6.82,6.25,6.26Zm19.9-158.62H1244.5L1228,62l2.84,2.84,2.85,2.84ZM1233.7,226.27l22.74-22.74H1244.5L1228,220l2.84,3.41Zm-3.42,170h6.26l-2.84-2.84Zm46-351.35H1264.4l-26.72,26.72,6.25,6.26Zm0,158.62H1264.4l-26.72,26.72,6.25,5.69Zm28.43-98.92h-58v54h58Zm-8.53-59.7h-11.94L1250.18,79h11.94Zm-46,192.73h11.94l34.11-34.11h-11.94Zm66-192.73h-11.94L1270.08,79H1282Zm-11.94,158.62-34.11,34.11H1282l34.11-34.11Zm32.12-158.62h-12.58L1289.41,79H1302Zm-46.9,192.73H1302l34.32-34.11h-12.58Zm66-192.73h-12L1309.31,79h12Zm-46.15,192.73h12l34.18-34.11h-12Zm50-188.18L1354.79,54l-9.09,9.1-.57,1.13L1340,68.79,1325.8,83v76.76L1340,174.54l5.69,5.11,9.12,9.1,4.55,4.55ZM1325.8,391.71l33.54-33.54V208.08l-12.51,12.51-1.13,1.14-.57.56-1.71,1.71-.57.57-2.84,2.84-14.21,14.21Zm4.31,4.55h11.38l27.28-26.72-5.68-5.68L1350,376.37l-2.84,2.84-.57.57-3.41,3.41-4,4Zm19.15,0h11.94l17-17.05-6.25-5.69Zm49.88-386-13.65,13.65-1.13.57L1379.81,29l-5.12,5.69-9.1,9.1V193.3l33.55-33.54Zm0,355.33V241.62l-33.55-33.54V358.17l14.22,14.22,5.68,5.11,13.65,14.21V365.56ZM1369,396.26h11.94l6.83-6.82-5.69-6.25Zm19.9,0h6.26l-3.41-2.84Z");
    			add_location(path4, file$6, 0, 8914, 8914);
    			attr_dev(g0, "id", "Layer_1-2");
    			attr_dev(g0, "data-name", "Layer 1");
    			add_location(g0, file$6, 0, 105, 105);
    			attr_dev(g1, "id", "Layer_2");
    			attr_dev(g1, "data-name", "Layer 2");
    			add_location(g1, file$6, 0, 69, 69);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 1404.82 416.73");
    			add_location(svg, file$6, 0, 0, 0);
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
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props) {
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
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Error",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/routes/ScreenError.svelte generated by Svelte v3.32.0 */

    const { Error: Error_1$2 } = globals;
    const file$7 = "src/routes/ScreenError.svelte";

    // (8:0) <AppHeader>
    function create_default_slot_1$3(ctx) {
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
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(8:0) <AppHeader>",
    		ctx
    	});

    	return block;
    }

    // (12:0) <ContentWrapper>
    function create_default_slot$3(ctx) {
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
    			add_location(div, file$7, 12, 2, 291);
    			attr_dev(a, "href", "/#/start");
    			add_location(a, file$7, 13, 2, 325);
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
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(12:0) <ContentWrapper>",
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
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScreenError",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/components/HomeHabitButton.svelte generated by Svelte v3.32.0 */

    const { console: console_1$3 } = globals;
    const file$8 = "src/components/HomeHabitButton.svelte";

    // (120:46) {:else}
    function create_else_block_2(ctx) {
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
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(120:46) {:else}",
    		ctx
    	});

    	return block;
    }

    // (120:38) 
    function create_if_block_5(ctx) {
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
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(120:38) ",
    		ctx
    	});

    	return block;
    }

    // (118:8) {#if habit.adminIsActive && habit.detailDuration > 1}
    function create_if_block_4(ctx) {
    	let t0_value = /*habit*/ ctx[0].detailDuration + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = text(" day");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*habit*/ 1 && t0_value !== (t0_value = /*habit*/ ctx[0].detailDuration + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(118:8) {#if habit.adminIsActive && habit.detailDuration > 1}",
    		ctx
    	});

    	return block;
    }

    // (126:6) {:else}
    function create_else_block_1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "+";
    			attr_dev(div, "class", "mt-1 text-6xl font-bold text-center text-blue-900");
    			add_location(div, file$8, 126, 8, 3391);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(126:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (122:6) {#if habit.adminIsActive}
    function create_if_block_3(ctx) {
    	let div;
    	let t_value = /*habit*/ ctx[0].detailCode + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "mt-1 text-6xl font-extrabold text-center text-blue-900");
    			add_location(div, file$8, 122, 8, 3256);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*habit*/ 1 && t_value !== (t_value = /*habit*/ ctx[0].detailCode + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(122:6) {#if habit.adminIsActive}",
    		ctx
    	});

    	return block;
    }

    // (130:48) {:else}
    function create_else_block$1(ctx) {
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
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(130:48) {:else}",
    		ctx
    	});

    	return block;
    }

    // (130:8) {#if habit.adminIsActive}
    function create_if_block_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*timeRemaining*/ ctx[2]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*timeRemaining*/ 4) set_data_dev(t, /*timeRemaining*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(130:8) {#if habit.adminIsActive}",
    		ctx
    	});

    	return block;
    }

    // (150:40) 
    function create_if_block_1(ctx) {
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
    			add_location(i0, file$8, 157, 10, 4732);
    			attr_dev(button0, "class", "flex justify-center items-center focus:ring-1 outline-none\n          focus:ring-offset-1 focus:ring-green-500 focus:outline-none\n          transition-colors duration-75");
    			add_location(button0, file$8, 151, 8, 4441);
    			attr_dev(i1, "class", "bg-red-100 far fa-2x fa-window-close");
    			add_location(i1, file$8, 164, 10, 5066);
    			attr_dev(button1, "class", "flex justify-center items-center focus:ring-1 outline-none\n          focus:ring-offset-1 focus:ring-red-500 focus:outline-none\n          transition-colors duration-75");
    			add_location(button1, file$8, 159, 8, 4811);
    			attr_dev(div, "class", "py-1 flex justify-center items-center space-x-2");
    			add_location(div, file$8, 150, 6, 4371);
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
    					listen_dev(button0, "click", /*click_handler*/ ctx[8], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[9], false, false, false)
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
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(150:40) ",
    		ctx
    	});

    	return block;
    }

    // (135:4) {#if !habit.adminIsActive && $currentActiveHabit === i}
    function create_if_block$1(ctx) {
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
    			add_location(span, file$8, 142, 10, 4134);
    			set_style(button, "height", "32px");
    			attr_dev(button, "class", "flex justify-center items-center focus:ring-1 outline-none\n          focus:ring-offset-1 focus:ring-green-500 focus:outline-none\n          transition-colors duration-75");
    			add_location(button, file$8, 136, 8, 3861);
    			attr_dev(div, "class", "py-1 flex justify-center items-center space-x-2");
    			add_location(div, file$8, 135, 6, 3791);
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
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(135:4) {#if !habit.adminIsActive && $currentActiveHabit === i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div4;
    	let button;
    	let div2;
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let div3;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*habit*/ ctx[0].adminIsActive && /*habit*/ ctx[0].detailDuration > 1) return create_if_block_4;
    		if (/*habit*/ ctx[0].adminIsActive) return create_if_block_5;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*habit*/ ctx[0].adminIsActive) return create_if_block_3;
    		return create_else_block_1;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	function select_block_type_2(ctx, dirty) {
    		if (/*habit*/ ctx[0].adminIsActive) return create_if_block_2;
    		return create_else_block$1;
    	}

    	let current_block_type_2 = select_block_type_2(ctx);
    	let if_block2 = current_block_type_2(ctx);

    	function select_block_type_3(ctx, dirty) {
    		if (!/*habit*/ ctx[0].adminIsActive && /*$currentActiveHabit*/ ctx[3] === /*i*/ ctx[1]) return create_if_block$1;
    		if (/*$currentActiveHabit*/ ctx[3] === /*i*/ ctx[1]) return create_if_block_1;
    	}

    	let current_block_type_3 = select_block_type_3(ctx);
    	let if_block3 = current_block_type_3 && current_block_type_3(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			button = element("button");
    			div2 = element("div");
    			div0 = element("div");
    			if_block0.c();
    			t0 = space();
    			if_block1.c();
    			t1 = space();
    			div1 = element("div");
    			if_block2.c();
    			t2 = space();
    			div3 = element("div");
    			if (if_block3) if_block3.c();
    			attr_dev(div0, "class", "uppercase font-extrabold text-gray-900 text-xs text-left");
    			add_location(div0, file$8, 116, 6, 2970);
    			attr_dev(div1, "class", "mt-2 text-sm font-bold text-center text-gray-500 uppercase");
    			add_location(div1, file$8, 128, 6, 3480);
    			attr_dev(div2, "class", "flex flex-col mx-auto");
    			add_location(div2, file$8, 115, 4, 2928);
    			attr_dev(button, "class", "bg-white py-1 px-2 border-2 border-blue-100 shadow rounded-sm\n    hover:bg-blue-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-700\n    focus:outline-none transition-colors duration-75 svelte-6i48u6");
    			toggle_class(button, "selected", /*$currentActiveHabit*/ ctx[3] === /*i*/ ctx[1] || /*$currentActiveHabit*/ ctx[3] === null && !/*habit*/ ctx[0].adminIsActive);
    			add_location(button, file$8, 109, 2, 2581);
    			attr_dev(div3, "class", "bg-white mt-2 shadow rounded-sm sm:rounded-lg sm:px-10");
    			add_location(div3, file$8, 133, 2, 3656);
    			attr_dev(div4, "class", "flex flex-col");
    			add_location(div4, file$8, 108, 0, 2551);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, button);
    			append_dev(button, div2);
    			append_dev(div2, div0);
    			if_block0.m(div0, null);
    			append_dev(div2, t0);
    			if_block1.m(div2, null);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			if_block2.m(div1, null);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			if (if_block3) if_block3.m(div3, null);

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

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div2, t1);
    				}
    			}

    			if (current_block_type_2 === (current_block_type_2 = select_block_type_2(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type_2(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div1, null);
    				}
    			}

    			if (dirty & /*$currentActiveHabit, i, habit*/ 11) {
    				toggle_class(button, "selected", /*$currentActiveHabit*/ ctx[3] === /*i*/ ctx[1] || /*$currentActiveHabit*/ ctx[3] === null && !/*habit*/ ctx[0].adminIsActive);
    			}

    			if (current_block_type_3 === (current_block_type_3 = select_block_type_3(ctx)) && if_block3) {
    				if_block3.p(ctx, dirty);
    			} else {
    				if (if_block3) if_block3.d(1);
    				if_block3 = current_block_type_3 && current_block_type_3(ctx);

    				if (if_block3) {
    					if_block3.c();
    					if_block3.m(div3, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if_block0.d();
    			if_block1.d();
    			if_block2.d();

    			if (if_block3) {
    				if_block3.d();
    			}

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
    	let updateTime;
    	let $API_ENDPOINT;
    	let $activeUserHabits;
    	let $currentActiveHabit;
    	validate_store(API_ENDPOINT, "API_ENDPOINT");
    	component_subscribe($$self, API_ENDPOINT, $$value => $$invalidate(10, $API_ENDPOINT = $$value));
    	validate_store(activeUserHabits, "activeUserHabits");
    	component_subscribe($$self, activeUserHabits, $$value => $$invalidate(11, $activeUserHabits = $$value));
    	validate_store(currentActiveHabit, "currentActiveHabit");
    	component_subscribe($$self, currentActiveHabit, $$value => $$invalidate(3, $currentActiveHabit = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("HomeHabitButton", slots, []);
    	let { habit } = $$props;
    	let { i } = $$props;

    	const handleClick = () => {
    		currentActiveHabit.set(i);
    	};

    	const handleHabitAdd = () => {
    		push("/add");
    	};

    	const update = setInterval(
    		() => {
    			$$invalidate(7, dateCurrent++, dateCurrent);
    		},
    		1000
    	);

    	const getTimeRemaining = (endTime, curTime) => {
    		if (habit.adminIsActive) {
    			let timeToReport = (endTime - curTime) / 1000;
    			let val, unit;

    			if (timeToReport > 86400) {
    				val = timeToReport / 3600 / 24;
    				unit = "days";
    			} else if (timeToReport > 3600) {
    				val = timeToReport / 3600;
    				unit = "hrs";
    			} else if (timeToReport > 60) {
    				val = timeToReport / 60;
    				unit = "min";
    			} else {
    				val = timeToReport;
    				unit = "sec";
    			}

    			return `${val.toFixed(0)} ${unit}`;
    		}
    	};

    	let dateStart = new Date(habit.detailDateStartUTCString).getTime();
    	let dateEnd = new Date(habit.detailDateEndUTCString).getTime();
    	let dateCurrent = new Date().getTime();
    	let timeRemaining = getTimeRemaining(dateEnd, dateCurrent);

    	// const handleHabitCheck = val => {
    	//   console.log(val);
    	// };
    	const handleHabitCheck = async val => {
    		const fetchURL = $API_ENDPOINT + "/addHabitCheck";

    		const fetchOptions = {
    			method: "POST",
    			headers: { "content-type": "application/json" },
    			body: JSON.stringify({
    				checkDate: new Date(),
    				checkIsOk: val,
    				habitId: habit.adminHabitId
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
    			// res.check = {
    			// date: "",
    			// isOk: bool
    			// }
    			let newHabitData = $activeUserHabits;

    			newHabitData[$currentActiveHabit] = res;
    			activeUserHabits.set(newHabitData);
    			isNewActiveUserHabit.set(true);
    		}).catch(err => {
    			console.clear();
    			errMessage.set(err);
    			push(`/error`);
    		});
    	};

    	const writable_props = ["habit", "i"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<HomeHabitButton> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => handleHabitCheck(true);
    	const click_handler_1 = () => handleHabitCheck(false);

    	$$self.$$set = $$props => {
    		if ("habit" in $$props) $$invalidate(0, habit = $$props.habit);
    		if ("i" in $$props) $$invalidate(1, i = $$props.i);
    	};

    	$$self.$capture_state = () => ({
    		currentActiveHabit,
    		errMessage,
    		API_ENDPOINT,
    		activeUserHabits,
    		isNewActiveUserHabit,
    		push,
    		habit,
    		i,
    		handleClick,
    		handleHabitAdd,
    		update,
    		getTimeRemaining,
    		dateStart,
    		dateEnd,
    		dateCurrent,
    		timeRemaining,
    		handleHabitCheck,
    		$API_ENDPOINT,
    		$activeUserHabits,
    		$currentActiveHabit,
    		updateTime
    	});

    	$$self.$inject_state = $$props => {
    		if ("habit" in $$props) $$invalidate(0, habit = $$props.habit);
    		if ("i" in $$props) $$invalidate(1, i = $$props.i);
    		if ("dateStart" in $$props) dateStart = $$props.dateStart;
    		if ("dateEnd" in $$props) $$invalidate(16, dateEnd = $$props.dateEnd);
    		if ("dateCurrent" in $$props) $$invalidate(7, dateCurrent = $$props.dateCurrent);
    		if ("timeRemaining" in $$props) $$invalidate(2, timeRemaining = $$props.timeRemaining);
    		if ("updateTime" in $$props) updateTime = $$props.updateTime;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*dateCurrent*/ 128) {
    			 updateTime = dateEnd - dateCurrent;
    		}

    		if ($$self.$$.dirty & /*dateCurrent*/ 128) {
    			 $$invalidate(2, timeRemaining = getTimeRemaining(dateEnd, dateCurrent));
    		}
    	};

    	return [
    		habit,
    		i,
    		timeRemaining,
    		$currentActiveHabit,
    		handleClick,
    		handleHabitAdd,
    		handleHabitCheck,
    		dateCurrent,
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
    			console_1$3.warn("<HomeHabitButton> was created without expected prop 'habit'");
    		}

    		if (/*i*/ ctx[1] === undefined && !("i" in props)) {
    			console_1$3.warn("<HomeHabitButton> was created without expected prop 'i'");
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

    /* src/components/Modal.svelte generated by Svelte v3.32.0 */
    const file$9 = "src/components/Modal.svelte";

    function create_fragment$a(ctx) {
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
    	let t4_value = /*contentModal*/ ctx[1].title + "";
    	let t4;
    	let t5;
    	let div3;
    	let p;
    	let t6_value = /*contentModal*/ ctx[1].details + "";
    	let t6;
    	let t7;
    	let div6;
    	let button;
    	let t8_value = /*contentModal*/ ctx[1].button + "";
    	let t8;
    	let div7_intro;
    	let div9_intro;
    	let mounted;
    	let dispose;

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
    			button = element("button");
    			t8 = text(t8_value);
    			attr_dev(div0, "class", "absolute inset-0 bg-gray-500 opacity-75");
    			add_location(div0, file$9, 24, 6, 627);
    			attr_dev(div1, "class", "fixed inset-0 transition-opacity");
    			attr_dev(div1, "aria-hidden", "true");
    			add_location(div1, file$9, 23, 4, 555);
    			attr_dev(span, "class", "hidden sm:inline-block sm:align-middle sm:h-screen");
    			attr_dev(span, "aria-hidden", "true");
    			add_location(span, file$9, 28, 4, 784);
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			attr_dev(path, "stroke-width", "2");
    			attr_dev(path, "d", "M5 13l4 4L19 7");
    			add_location(path, file$9, 63, 12, 2043);
    			attr_dev(svg, "class", "h-6 w-6 text-green-600");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "stroke", "currentColor");
    			attr_dev(svg, "aria-hidden", "true");
    			add_location(svg, file$9, 56, 10, 1814);
    			attr_dev(div2, "class", "mx-auto flex items-center justify-center h-12 w-12 rounded-full\n          bg-green-100");
    			add_location(div2, file$9, 52, 8, 1653);
    			attr_dev(h3, "class", "text-lg leading-6 font-medium text-gray-900");
    			attr_dev(h3, "id", "modal-headline");
    			add_location(h3, file$9, 71, 10, 2280);
    			attr_dev(p, "class", "text-sm text-gray-500");
    			add_location(p, file$9, 77, 12, 2471);
    			attr_dev(div3, "class", "mt-2");
    			add_location(div3, file$9, 76, 10, 2440);
    			attr_dev(div4, "class", "mt-3 text-center sm:mt-5");
    			add_location(div4, file$9, 70, 8, 2231);
    			add_location(div5, file$9, 51, 6, 1639);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "inline-flex justify-center w-full rounded-md border\n          border-transparent shadow-sm px-4 py-2 bg-blue-900 text-base\n          font-medium text-white hover:bg-blue-500 focus:outline-none\n          focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 sm:text-sm");
    			add_location(button, file$9, 82, 8, 2617);
    			attr_dev(div6, "class", "mt-5 sm:mt-6");
    			add_location(div6, file$9, 81, 6, 2582);
    			attr_dev(div7, "class", "inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4\n      text-left overflow-hidden shadow-xl transform transition-all sm:my-8\n      sm:align-middle sm:max-w-sm sm:w-full sm:p-6");
    			attr_dev(div7, "role", "dialog");
    			attr_dev(div7, "aria-modal", "true");
    			attr_dev(div7, "aria-labelledby", "modal-headline");
    			add_location(div7, file$9, 43, 4, 1302);
    			attr_dev(div8, "class", "flex items-end justify-center min-h-screen pt-4 px-4 pb-20\n    text-center sm:block sm:p-0");
    			add_location(div8, file$9, 10, 2, 184);
    			attr_dev(div9, "class", "fixed z-10 inset-0 overflow-y-auto");
    			add_location(div9, file$9, 9, 0, 125);
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
    			append_dev(div6, button);
    			append_dev(button, t8);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*handleModal*/ ctx[0])) /*handleModal*/ ctx[0].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*contentModal*/ 2 && t4_value !== (t4_value = /*contentModal*/ ctx[1].title + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*contentModal*/ 2 && t6_value !== (t6_value = /*contentModal*/ ctx[1].details + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*contentModal*/ 2 && t8_value !== (t8_value = /*contentModal*/ ctx[1].button + "")) set_data_dev(t8, t8_value);
    		},
    		i: function intro(local) {
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
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Modal", slots, []);
    	let { handleModal } = $$props;
    	let { contentModal } = $$props;
    	const writable_props = ["handleModal", "contentModal"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("handleModal" in $$props) $$invalidate(0, handleModal = $$props.handleModal);
    		if ("contentModal" in $$props) $$invalidate(1, contentModal = $$props.contentModal);
    	};

    	$$self.$capture_state = () => ({ fade, fly, handleModal, contentModal });

    	$$self.$inject_state = $$props => {
    		if ("handleModal" in $$props) $$invalidate(0, handleModal = $$props.handleModal);
    		if ("contentModal" in $$props) $$invalidate(1, contentModal = $$props.contentModal);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [handleModal, contentModal];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { handleModal: 0, contentModal: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*handleModal*/ ctx[0] === undefined && !("handleModal" in props)) {
    			console.warn("<Modal> was created without expected prop 'handleModal'");
    		}

    		if (/*contentModal*/ ctx[1] === undefined && !("contentModal" in props)) {
    			console.warn("<Modal> was created without expected prop 'contentModal'");
    		}
    	}

    	get handleModal() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleModal(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get contentModal() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set contentModal(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/ScreenHome.svelte generated by Svelte v3.32.0 */

    const { console: console_1$4 } = globals;
    const file$a = "src/routes/ScreenHome.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    // (172:8) {:else}
    function create_else_block_1$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Your New Habit");
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
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(172:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (170:8) {#if $activeUserHabits[$currentActiveHabit] && $activeUserHabits[$currentActiveHabit].adminIsActive}
    function create_if_block_2$1(ctx) {
    	let t_value = /*$activeUserHabits*/ ctx[0][/*$currentActiveHabit*/ ctx[2]].detailTitle + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$activeUserHabits, $currentActiveHabit*/ 5 && t_value !== (t_value = /*$activeUserHabits*/ ctx[0][/*$currentActiveHabit*/ ctx[2]].detailTitle + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(170:8) {#if $activeUserHabits[$currentActiveHabit] && $activeUserHabits[$currentActiveHabit].adminIsActive}",
    		ctx
    	});

    	return block;
    }

    // (177:8) {:else}
    function create_else_block$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("What will you do? Who will you become? Tap the [Add] button below to\n          create a new habit.");
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
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(177:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (175:8) {#if $activeUserHabits[$currentActiveHabit] && $activeUserHabits[$currentActiveHabit].adminIsActive}
    function create_if_block_1$1(ctx) {
    	let t_value = /*$activeUserHabits*/ ctx[0][/*$currentActiveHabit*/ ctx[2]].detailDescription + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$activeUserHabits, $currentActiveHabit*/ 5 && t_value !== (t_value = /*$activeUserHabits*/ ctx[0][/*$currentActiveHabit*/ ctx[2]].detailDescription + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(175:8) {#if $activeUserHabits[$currentActiveHabit] && $activeUserHabits[$currentActiveHabit].adminIsActive}",
    		ctx
    	});

    	return block;
    }

    // (196:4) {#each $activeUserHabits as habit, i}
    function create_each_block(ctx) {
    	let homehabitbutton;
    	let current;

    	homehabitbutton = new HomeHabitButton({
    			props: {
    				habit: /*habit*/ ctx[10],
    				i: /*i*/ ctx[12]
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
    			if (dirty & /*$activeUserHabits*/ 1) homehabitbutton_changes.habit = /*habit*/ ctx[10];
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
    		id: create_each_block.name,
    		type: "each",
    		source: "(196:4) {#each $activeUserHabits as habit, i}",
    		ctx
    	});

    	return block;
    }

    // (202:0) {#if $isNewSocialModal}
    function create_if_block$2(ctx) {
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				handleModal: /*handleModal*/ ctx[7],
    				contentModal: /*contentModal*/ ctx[4]
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
    		p: noop,
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
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(202:0) {#if $isNewSocialModal}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
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
    	let h10;
    	let div3;
    	let t6_value = /*$activeUserDetails*/ ctx[1].name + "";
    	let t6;
    	let t7;
    	let div4;
    	let t8_value = /*$activeUserDetails*/ ctx[1].title + "";
    	let t8;
    	let t9;
    	let div7;
    	let div5;
    	let t10;
    	let div6;
    	let span2;
    	let t11_value = /*$activeUserDetails*/ ctx[1].initials + "";
    	let t11;
    	let t12;
    	let div8;
    	let span3;
    	let t14;
    	let div9;
    	let span4;
    	let t15_value = /*$activeUserDetails*/ ctx[1].habitHistoryIds.length + "";
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
    	let h11;
    	let t19;
    	let p;
    	let t20;
    	let button2;
    	let i2;
    	let t21;
    	let section3;
    	let div11_intro;
    	let t22;
    	let if_block2_anchor;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*$activeUserHabits*/ ctx[0][/*$currentActiveHabit*/ ctx[2]] && /*$activeUserHabits*/ ctx[0][/*$currentActiveHabit*/ ctx[2]].adminIsActive) return create_if_block_2$1;
    		return create_else_block_1$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*$activeUserHabits*/ ctx[0][/*$currentActiveHabit*/ ctx[2]] && /*$activeUserHabits*/ ctx[0][/*$currentActiveHabit*/ ctx[2]].adminIsActive) return create_if_block_1$1;
    		return create_else_block$2;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);
    	let each_value = /*$activeUserHabits*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block2 = /*$isNewSocialModal*/ ctx[3] && create_if_block$2(ctx);

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
    			h10 = element("h1");
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
    			span3.textContent = `${/*validActiveHabits*/ ctx[8].length}`;
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
    			h11 = element("h1");
    			if_block0.c();
    			t19 = space();
    			p = element("p");
    			if_block1.c();
    			t20 = space();
    			button2 = element("button");
    			i2 = element("i");
    			t21 = space();
    			section3 = element("section");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t22 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			attr_dev(div0, "class", "w-1/2 uppercase text-gray-500 font-bold text-xs");
    			add_location(div0, file$a, 104, 6, 2083);
    			add_location(span0, file$a, 107, 8, 2254);
    			attr_dev(span1, "class", "ml-2");
    			add_location(span1, file$a, 108, 8, 2280);
    			attr_dev(div1, "class", "flex justify-between uppercase text-gray-500 font-bold text-xs");
    			add_location(div1, file$a, 105, 6, 2161);
    			attr_dev(div2, "class", "opacity-0 px-4 flex items-center justify-between");
    			add_location(div2, file$a, 103, 4, 2014);
    			attr_dev(section0, "class", "home-score pt-3");
    			add_location(section0, file$a, 102, 2, 1976);
    			attr_dev(div3, "class", "text-lg font-bold leading-tight");
    			add_location(div3, file$a, 115, 6, 2442);
    			attr_dev(div4, "class", "text-sm font-extrabold leading-tight text-blue-900");
    			add_location(div4, file$a, 118, 6, 2541);
    			attr_dev(h10, "class", "user-title text-center  svelte-lab9ei");
    			add_location(h10, file$a, 114, 4, 2399);
    			attr_dev(div5, "class", "absolute inset-0 bg-blue-100 rounded-full");
    			add_location(div5, file$a, 123, 6, 2706);
    			add_location(span2, file$a, 132, 8, 3093);
    			attr_dev(div6, "style", "font-family: 'Bungee', cursive; width: 168px; height 168px;");
    			attr_dev(div6, "class", "relative rounded-full m-1 z-0 text-9xl flex justify-center\n        items-center h-full");
    			add_location(div6, file$a, 128, 6, 2900);
    			attr_dev(div7, "class", "user-img relative svelte-lab9ei");
    			add_location(div7, file$a, 122, 4, 2668);
    			add_location(span3, file$a, 138, 6, 3332);
    			attr_dev(div8, "class", "user-stat1 bg-white text-lg border-1 h-10 w-10 flex justify-center\n      items-center rounded-full border-blue-100 font-extrabold shadow ml-5 svelte-lab9ei");
    			add_location(div8, file$a, 135, 4, 3164);
    			add_location(span4, file$a, 143, 6, 3555);
    			attr_dev(div9, "class", "user-stat2 bg-white text-lg border-1 h-10 w-10 flex justify-center\n      items-center rounded-full border-blue-100 font-extrabold shadow mr-5 svelte-lab9ei");
    			add_location(div9, file$a, 140, 4, 3387);
    			attr_dev(i0, "class", " fas fa-1x fa-history text-blue-900");
    			add_location(i0, file$a, 151, 6, 3933);
    			attr_dev(button0, "class", "user-icon1 bg-white h-14 w-14 flex justify-center items-center\n      rounded-full border-2 border-blue-100 shadow hover:bg-blue-200\n      focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 focus:outline-none\n      transition-colors duration-75 svelte-lab9ei");
    			add_location(button0, file$a, 145, 4, 3627);
    			attr_dev(i1, "class", " fas fa-1x fa-share-alt text-blue-900");
    			add_location(i1, file$a, 160, 6, 4372);
    			attr_dev(button1, "class", "user-icon2 bg-white h-14 w-14 flex justify-center items-center\n      rounded-full border-2 border-blue-100 shadow hover:bg-blue-200\n      focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 focus:outline-none\n      transition-colors duration-75 svelte-lab9ei");
    			add_location(button1, file$a, 154, 4, 4067);
    			attr_dev(section1, "class", "home-user home-user2 pt-6 svelte-lab9ei");
    			add_location(section1, file$a, 113, 2, 2351);
    			attr_dev(h11, "class", "text-xl font-bold");
    			add_location(h11, file$a, 168, 6, 4645);
    			attr_dev(p, "class", "text-base mt-1 text-gray-700");
    			add_location(p, file$a, 173, 6, 4901);
    			attr_dev(i2, "class", "fas fa-1x fa-pencil-alt text-blue-900");
    			add_location(i2, file$a, 186, 8, 5525);
    			attr_dev(button2, "class", "user-icon1 absolute right-0 bottom-0 inline-flex ml-2 bg-white\n        h-6 w-6 justify-center items-center focus:outline-none\n        focus:border-blue-400 focus:border-2 mr-2 mb-2");
    			add_location(button2, file$a, 181, 6, 5276);
    			attr_dev(div10, "class", "relative bg-white h-full py-2 px-2 shadow rounded sm:rounded-lg\n      sm:px-10 text-left");
    			add_location(div10, file$a, 165, 4, 4530);
    			attr_dev(section2, "class", "home-habit-info pt-6 sm:mx-auto sm:w-full sm:max-w-md svelte-lab9ei");
    			add_location(section2, file$a, 164, 2, 4454);
    			attr_dev(section3, "class", "home-habit-select pt-3 grid grid-cols-3 grid-rows-1 gap-3 sm:mx-auto\n    sm:w-full sm:max-w-md");
    			add_location(section3, file$a, 192, 2, 5689);
    			attr_dev(div11, "class", "home-grid pb-2 overflow-y-scroll px-5 svelte-lab9ei");
    			add_location(div11, file$a, 100, 0, 1913);
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
    			append_dev(section1, h10);
    			append_dev(h10, div3);
    			append_dev(div3, t6);
    			append_dev(h10, t7);
    			append_dev(h10, div4);
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
    			append_dev(div10, h11);
    			if_block0.m(h11, null);
    			append_dev(div10, t19);
    			append_dev(div10, p);
    			if_block1.m(p, null);
    			append_dev(div10, t20);
    			append_dev(div10, button2);
    			append_dev(button2, i2);
    			append_dev(div11, t21);
    			append_dev(div11, section3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section3, null);
    			}

    			insert_dev(target, t22, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*handleHistory*/ ctx[5], false, false, false),
    					listen_dev(button1, "click", /*handleSocial*/ ctx[6], false, false, false),
    					listen_dev(button2, "click", /*handleHabitEdit*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*$activeUserDetails*/ 2) && t6_value !== (t6_value = /*$activeUserDetails*/ ctx[1].name + "")) set_data_dev(t6, t6_value);
    			if ((!current || dirty & /*$activeUserDetails*/ 2) && t8_value !== (t8_value = /*$activeUserDetails*/ ctx[1].title + "")) set_data_dev(t8, t8_value);
    			if ((!current || dirty & /*$activeUserDetails*/ 2) && t11_value !== (t11_value = /*$activeUserDetails*/ ctx[1].initials + "")) set_data_dev(t11, t11_value);
    			if ((!current || dirty & /*$activeUserDetails*/ 2) && t15_value !== (t15_value = /*$activeUserDetails*/ ctx[1].habitHistoryIds.length + "")) set_data_dev(t15, t15_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(h11, null);
    				}
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(p, null);
    				}
    			}

    			if (dirty & /*$activeUserHabits*/ 1) {
    				each_value = /*$activeUserHabits*/ ctx[0];
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

    			if (/*$isNewSocialModal*/ ctx[3]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*$isNewSocialModal*/ 8) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block$2(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
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

    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div11);
    			if_block0.d();
    			if_block1.d();
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t22);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    			mounted = false;
    			run_all(dispose);
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
    	let $activeUserHabits;
    	let $activeUserDetails;
    	let $currentActiveHabit;
    	let $isNewSocialModal;
    	validate_store(activeUserHabits, "activeUserHabits");
    	component_subscribe($$self, activeUserHabits, $$value => $$invalidate(0, $activeUserHabits = $$value));
    	validate_store(activeUserDetails, "activeUserDetails");
    	component_subscribe($$self, activeUserDetails, $$value => $$invalidate(1, $activeUserDetails = $$value));
    	validate_store(currentActiveHabit, "currentActiveHabit");
    	component_subscribe($$self, currentActiveHabit, $$value => $$invalidate(2, $currentActiveHabit = $$value));
    	validate_store(isNewSocialModal, "isNewSocialModal");
    	component_subscribe($$self, isNewSocialModal, $$value => $$invalidate(3, $isNewSocialModal = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ScreenHome", slots, []);

    	const contentModal = {
    		title: "Social Share Unavailable",
    		details: "This feature will be enabled shortly, check back again.",
    		button: "Go back to App"
    	};

    	const handleHistory = () => {
    		push("/history");
    	};

    	const handleSocial = () => {
    		isNewSocialModal.set(true);
    	};

    	const handleModal = () => {
    		isNewSocialModal.set(false);
    	};

    	const validActiveHabits = $activeUserHabits.filter(habit => {
    		return habit.adminIsActive == true;
    	});

    	const handleHabitEdit = () => {
    		push("/edit");
    	};

    	console.log("$activeUserHabits", $activeUserHabits);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$4.warn(`<ScreenHome> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		currentActiveHabit,
    		isNewSocialModal,
    		activeUserDetails,
    		activeUserHabits,
    		fade,
    		push,
    		AppHeader,
    		ContentWrapper,
    		HomeHabitButton,
    		Modal,
    		contentModal,
    		handleHistory,
    		handleSocial,
    		handleModal,
    		validActiveHabits,
    		handleHabitEdit,
    		$activeUserHabits,
    		$activeUserDetails,
    		$currentActiveHabit,
    		$isNewSocialModal
    	});

    	return [
    		$activeUserHabits,
    		$activeUserDetails,
    		$currentActiveHabit,
    		$isNewSocialModal,
    		contentModal,
    		handleHistory,
    		handleSocial,
    		handleModal,
    		validActiveHabits,
    		handleHabitEdit
    	];
    }

    class ScreenHome extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScreenHome",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/components/AddEditDeleteHabit.svelte generated by Svelte v3.32.0 */
    const file$b = "src/components/AddEditDeleteHabit.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	child_ctx[21] = list;
    	child_ctx[22] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	return child_ctx;
    }

    // (62:12) {:else}
    function create_else_block_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("24 Hours");
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
    		source: "(62:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (60:12) {#if tempLocalUserHabit.detailDuration > 1}
    function create_if_block_2$2(ctx) {
    	let t0_value = /*tempLocalUserHabit*/ ctx[2].detailDuration + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = text(" Days");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tempLocalUserHabit*/ 4 && t0_value !== (t0_value = /*tempLocalUserHabit*/ ctx[2].detailDuration + "")) set_data_dev(t0, t0_value);
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
    		source: "(60:12) {#if tempLocalUserHabit.detailDuration > 1}",
    		ctx
    	});

    	return block;
    }

    // (80:12) {:else}
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
    		source: "(80:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (78:12) {#if tempLocalUserHabit.detailCode}
    function create_if_block_1$2(ctx) {
    	let t_value = /*tempLocalUserHabit*/ ctx[2].detailCode + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tempLocalUserHabit*/ 4 && t_value !== (t_value = /*tempLocalUserHabit*/ ctx[2].detailCode + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(78:12) {#if tempLocalUserHabit.detailCode}",
    		ctx
    	});

    	return block;
    }

    // (143:10) {#each $contentHabitDuration as option}
    function create_each_block_1(ctx) {
    	let option;
    	let t0_value = /*option*/ ctx[23].text + "";
    	let t0;
    	let t1;
    	let option_disabled_value;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.disabled = option_disabled_value = /*option*/ ctx[23].disabled;
    			option.__value = option_value_value = /*option*/ ctx[23];
    			option.value = option.__value;
    			add_location(option, file$b, 143, 12, 4957);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$contentHabitDuration*/ 16 && t0_value !== (t0_value = /*option*/ ctx[23].text + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*$contentHabitDuration*/ 16 && option_disabled_value !== (option_disabled_value = /*option*/ ctx[23].disabled)) {
    				prop_dev(option, "disabled", option_disabled_value);
    			}

    			if (dirty & /*$contentHabitDuration*/ 16 && option_value_value !== (option_value_value = /*option*/ ctx[23])) {
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
    		source: "(143:10) {#each $contentHabitDuration as option}",
    		ctx
    	});

    	return block;
    }

    // (209:12) {:else}
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
    		source: "(209:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (207:12) {#if tempLocalUserHabit.detailIsNewHabit}
    function create_if_block$3(ctx) {
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
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(207:12) {#if tempLocalUserHabit.detailIsNewHabit}",
    		ctx
    	});

    	return block;
    }

    // (225:12) {#each $contentHabitDetailCategory as category, i}
    function create_each_block$1(ctx) {
    	let div2;
    	let div0;
    	let input;
    	let input_id_value;
    	let input_name_value;
    	let t0;
    	let div1;
    	let label;
    	let t1_value = /*category*/ ctx[20].title + "";
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*category*/ ctx[20].content + "";
    	let t3;
    	let t4;
    	let mounted;
    	let dispose;

    	function input_change_handler() {
    		/*input_change_handler*/ ctx[15].call(input, /*i*/ ctx[22]);
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
    			attr_dev(input, "id", input_id_value = /*category*/ ctx[20].label);
    			attr_dev(input, "name", input_name_value = /*category*/ ctx[20].label);
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "class", "focus:ring-blue-900 h-4 w-4 text-blue-900\n                    border-gray-300 rounded");
    			add_location(input, file$b, 227, 18, 8133);
    			attr_dev(div0, "class", "flex items-center h-5");
    			add_location(div0, file$b, 226, 16, 8079);
    			attr_dev(label, "for", "comments");
    			attr_dev(label, "class", "font-medium text-gray-900");
    			add_location(label, file$b, 236, 18, 8541);
    			attr_dev(p, "class", "font-base text-gray-500");
    			add_location(p, file$b, 239, 18, 8680);
    			attr_dev(div1, "class", "ml-3 text-sm");
    			add_location(div1, file$b, 235, 16, 8496);
    			attr_dev(div2, "class", "relative flex items-start");
    			add_location(div2, file$b, 225, 14, 8023);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, input);
    			input.checked = /*tempLocalUserHabit*/ ctx[2][`detailIsCategory${/*i*/ ctx[22] + 1}`];
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

    			if (dirty & /*$contentHabitDetailCategory*/ 32 && input_id_value !== (input_id_value = /*category*/ ctx[20].label)) {
    				attr_dev(input, "id", input_id_value);
    			}

    			if (dirty & /*$contentHabitDetailCategory*/ 32 && input_name_value !== (input_name_value = /*category*/ ctx[20].label)) {
    				attr_dev(input, "name", input_name_value);
    			}

    			if (dirty & /*tempLocalUserHabit*/ 4) {
    				input.checked = /*tempLocalUserHabit*/ ctx[2][`detailIsCategory${/*i*/ ctx[22] + 1}`];
    			}

    			if (dirty & /*$contentHabitDetailCategory*/ 32 && t1_value !== (t1_value = /*category*/ ctx[20].title + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*$contentHabitDetailCategory*/ 32 && t3_value !== (t3_value = /*category*/ ctx[20].content + "")) set_data_dev(t3, t3_value);
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
    		source: "(225:12) {#each $contentHabitDetailCategory as category, i}",
    		ctx
    	});

    	return block;
    }

    // (49:0) <ContentWrapper>
    function create_default_slot$4(ctx) {
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
    		if (/*tempLocalUserHabit*/ ctx[2].detailDuration > 1) return create_if_block_2$2;
    		return create_else_block_2$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*tempLocalUserHabit*/ ctx[2].detailCode) return create_if_block_1$2;
    		return create_else_block_1$2;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);
    	let each_value_1 = /*$contentHabitDuration*/ ctx[4];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	function select_block_type_2(ctx, dirty) {
    		if (/*tempLocalUserHabit*/ ctx[2].detailIsNewHabit) return create_if_block$3;
    		return create_else_block$3;
    	}

    	let current_block_type_2 = select_block_type_2(ctx);
    	let if_block2 = current_block_type_2(ctx);
    	let each_value = /*$contentHabitDetailCategory*/ ctx[5];
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
    			button1.textContent = "Update";
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
    			t40 = text(/*altActionTitle*/ ctx[0]);
    			set_style(span0, "height", "50%");
    			set_style(span0, "top", "50%");
    			set_style(span0, "width", "28vw");
    			set_style(span0, "left", "calc(100% +\n              .5rem)");
    			attr_dev(span0, "class", "absolute text-blue-900 border-t-2 green-500");
    			add_location(span0, file$b, 62, 12, 1925);
    			set_style(span1, "left", "calc(100% + 28vw)");
    			attr_dev(span1, "class", "ml-2 p-2 rounded flex justify-center items-center absolute\n              top-0 bottom-0 leading-none text-xs font-extrabold text-gray-900\n              uppercase text-left");
    			add_location(span1, file$b, 66, 12, 2109);
    			attr_dev(div0, "class", "relative uppercase font-extrabold text-gray-900 text-xs\n            text-left");
    			add_location(div0, file$b, 56, 10, 1665);
    			set_style(span2, "height", "50%");
    			set_style(span2, "top", "50%");
    			set_style(span2, "width", "23vw");
    			set_style(span2, "left", "calc(100% +\n              .5rem)");
    			attr_dev(span2, "class", "absolute text-blue-900 border-t-2 green-500");
    			add_location(span2, file$b, 80, 12, 2666);
    			set_style(span3, "left", "calc(100% + 23vw)");
    			attr_dev(span3, "class", "ml-2 p-2 rounded flex justify-center items-center absolute\n              top-0 bottom-0 leading-none text-xs font-extrabold text-gray-900\n              uppercase text-left");
    			add_location(span3, file$b, 84, 12, 2850);
    			attr_dev(div1, "class", "relative mt-1 text-6xl font-extrabold text-center\n            text-blue-900");
    			add_location(div1, file$b, 74, 10, 2432);
    			set_style(span4, "height", "50%");
    			set_style(span4, "top", "50%");
    			set_style(span4, "width", "28vw");
    			set_style(span4, "left", "calc(100% +\n              .5rem)");
    			attr_dev(span4, "class", "absolute text-blue-900 border-t-2 green-500");
    			add_location(span4, file$b, 97, 12, 3306);
    			set_style(span5, "left", "calc(100% + 28vw)");
    			attr_dev(span5, "class", "ml-2 p-2 rounded flex justify-center items-center absolute\n              top-0 bottom-0 leading-none text-xs font-extrabold text-gray-900\n              uppercase text-left");
    			add_location(span5, file$b, 101, 12, 3490);
    			attr_dev(div2, "class", "relative mt-2 text-sm font-bold text-center text-gray-900\n            uppercase");
    			add_location(div2, file$b, 93, 10, 3171);
    			attr_dev(div3, "class", "flex flex-col mx-auto");
    			add_location(div3, file$b, 55, 8, 1619);
    			attr_dev(div4, "class", "w-1/3 bg-white py-1 px-2 border-2 border-blue-100 shadow\n        rounded-sm focus:outline-none");
    			add_location(div4, file$b, 52, 6, 1494);
    			attr_dev(label0, "for", "habit-title");
    			attr_dev(label0, "class", "block text-sm font-medium text-gray-900");
    			add_location(label0, file$b, 113, 8, 3851);
    			attr_dev(input0, "id", "habit-title");
    			attr_dev(input0, "name", "habit-title");
    			input0.required = true;
    			attr_dev(input0, "class", "appearance-none block w-full px-3 py-2 border border-gray-300\n            rounded-md shadow-sm placeholder-gray-400 focus:outline-none\n            focus:ring-blue-900 focus:border-blue-900 sm:text-sm");
    			add_location(input0, file$b, 119, 10, 4021);
    			attr_dev(div5, "class", "mt-1");
    			add_location(div5, file$b, 118, 8, 3992);
    			add_location(div6, file$b, 112, 6, 3837);
    			attr_dev(label1, "for", "location");
    			attr_dev(label1, "class", "block text-sm font-medium text-gray-900");
    			add_location(label1, file$b, 131, 8, 4437);
    			attr_dev(select, "id", "habit-duration");
    			attr_dev(select, "name", "habit-duration");
    			attr_dev(select, "class", "mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300\n          focus:outline-none focus:ring-blue-900 focus:border-blue-900\n          sm:text-sm rounded-md");
    			if (/*selected*/ ctx[3] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[11].call(select));
    			add_location(select, file$b, 134, 8, 4552);
    			add_location(div7, file$b, 130, 6, 4423);
    			attr_dev(label2, "for", "habit-desc");
    			attr_dev(label2, "class", "block text-sm font-medium text-gray-900");
    			add_location(label2, file$b, 151, 8, 5128);
    			attr_dev(textarea, "id", "habit-desc");
    			attr_dev(textarea, "name", "habit-desc");
    			textarea.required = true;
    			attr_dev(textarea, "rows", "3");
    			attr_dev(textarea, "class", "appearance-none block w-full px-3 py-2 border border-gray-300\n            rounded-md shadow-sm placeholder-gray-400 focus:outline-none\n            focus:ring-blue-900 focus:border-blue-900 sm:text-sm");
    			add_location(textarea, file$b, 155, 10, 5283);
    			attr_dev(div8, "class", "mt-1");
    			add_location(div8, file$b, 154, 8, 5254);
    			add_location(div9, file$b, 150, 6, 5114);
    			attr_dev(label3, "for", "habit-code");
    			attr_dev(label3, "class", "block text-sm font-medium text-gray-900");
    			add_location(label3, file$b, 168, 8, 5727);
    			attr_dev(input1, "id", "habit-code");
    			attr_dev(input1, "name", "habit-code");
    			input1.required = true;
    			attr_dev(input1, "maxlength", "2");
    			attr_dev(input1, "class", "appearance-none block w-full px-3 py-2 border border-gray-300\n            rounded-md shadow-sm placeholder-gray-400 focus:outline-none\n            focus:ring-blue-900 focus:border-blue-900 sm:text-sm");
    			add_location(input1, file$b, 172, 10, 5875);
    			attr_dev(div10, "class", "mt-1");
    			add_location(div10, file$b, 171, 8, 5846);
    			add_location(div11, file$b, 167, 6, 5713);
    			attr_dev(span6, "class", "sr-only");
    			add_location(span6, file$b, 196, 10, 6889);
    			attr_dev(span7, "aria-hidden", "true");
    			attr_dev(span7, "class", "translate-x-5 inline-block h-5 w-5 rounded-full bg-white\n            shadow transform ring-0 transition ease-in-out duration-200");
    			toggle_class(span7, "translate-x-5", /*tempLocalUserHabit*/ ctx[2].detailIsNewHabit);
    			add_location(span7, file$b, 198, 10, 7001);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "aria-pressed", "false");
    			attr_dev(button0, "aria-labelledby", "toggleLabel");
    			attr_dev(button0, "class", "bg-gray-200 relative inline-flex flex-shrink-0 h-6 w-11\n          border-2 border-transparent rounded-full cursor-pointer\n          transition-colors ease-in-out duration-200 focus:outline-none\n          focus:ring-2 focus:ring-offset-2 focus:ring-blue-900");
    			toggle_class(button0, "bg-blue-900", /*tempLocalUserHabit*/ ctx[2].detailIsNewHabit);
    			add_location(button0, file$b, 186, 8, 6395);
    			attr_dev(span8, "class", "text-sm font-medium text-gray-900");
    			add_location(span8, file$b, 205, 10, 7333);
    			attr_dev(span9, "class", "ml-3");
    			attr_dev(span9, "id", "toggleLabel");
    			add_location(span9, file$b, 204, 8, 7286);
    			attr_dev(div12, "class", "flex items-center");
    			add_location(div12, file$b, 184, 6, 6300);
    			attr_dev(span10, "class", "text-sm text-gray-900");
    			add_location(span10, file$b, 219, 12, 7806);
    			attr_dev(legend, "class", "block text-sm font-medium text-gray-900");
    			add_location(legend, file$b, 217, 10, 7710);
    			attr_dev(div13, "class", "mt-4 space-y-4");
    			add_location(div13, file$b, 222, 10, 7916);
    			add_location(fieldset, file$b, 216, 8, 7689);
    			attr_dev(div14, "class", "mt-6");
    			add_location(div14, file$b, 215, 6, 7662);
    			attr_dev(button1, "type", "submit");
    			attr_dev(button1, "class", "w-full flex justify-center py-2 px-4 border border-transparent\n          rounded-md shadow-sm text-sm font-bold text-white bg-blue-900\n          hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2\n          focus:ring-blue-900");
    			add_location(button1, file$b, 249, 8, 8887);
    			attr_dev(div15, "class", "mt-6");
    			add_location(div15, file$b, 248, 6, 8860);
    			attr_dev(form, "class", "space-y-6");
    			add_location(form, file$b, 50, 4, 1417);
    			attr_dev(div16, "class", "w-full border-t border-gray-300");
    			add_location(div16, file$b, 263, 10, 9363);
    			attr_dev(div17, "class", "absolute inset-0 flex items-center");
    			add_location(div17, file$b, 262, 8, 9304);
    			attr_dev(span11, "class", "px-2 bg-white text-gray-900");
    			add_location(span11, file$b, 266, 10, 9495);
    			attr_dev(div18, "class", "relative flex justify-center text-sm");
    			add_location(div18, file$b, 265, 8, 9434);
    			attr_dev(div19, "class", "relative");
    			add_location(div19, file$b, 261, 6, 9273);
    			attr_dev(span12, "class", "");
    			add_location(span12, file$b, 277, 12, 9900);
    			attr_dev(button2, "class", "w-full inline-flex justify-center py-2 px-4 border\n            border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium\n            text-gray-900 hover:bg-gray-50");
    			add_location(button2, file$b, 272, 10, 9648);
    			add_location(div20, file$b, 271, 8, 9632);
    			attr_dev(span13, "class", "");
    			add_location(span13, file$b, 286, 12, 10238);
    			attr_dev(button3, "class", "w-full inline-flex justify-center py-2 px-4 border\n            border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium\n            text-gray-900 hover:bg-gray-50");
    			add_location(button3, file$b, 281, 10, 9986);
    			add_location(div21, file$b, 280, 8, 9970);
    			attr_dev(div22, "class", "mt-6 grid grid-cols-2 gap-3");
    			add_location(div22, file$b, 270, 6, 9582);
    			attr_dev(div23, "class", "mt-6");
    			add_location(div23, file$b, 260, 4, 9248);
    			add_location(div24, file$b, 49, 2, 1407);
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
    			set_input_value(input0, /*tempLocalUserHabit*/ ctx[2].detailTitle);
    			append_dev(form, t14);
    			append_dev(form, div7);
    			append_dev(div7, label1);
    			append_dev(div7, t16);
    			append_dev(div7, select);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select, null);
    			}

    			select_option(select, /*selected*/ ctx[3]);
    			append_dev(form, t17);
    			append_dev(form, div9);
    			append_dev(div9, label2);
    			append_dev(div9, t19);
    			append_dev(div9, div8);
    			append_dev(div8, textarea);
    			set_input_value(textarea, /*tempLocalUserHabit*/ ctx[2].detailDescription);
    			append_dev(form, t20);
    			append_dev(form, div11);
    			append_dev(div11, label3);
    			append_dev(div11, t22);
    			append_dev(div11, div10);
    			append_dev(div10, input1);
    			set_input_value(input1, /*tempLocalUserHabit*/ ctx[2].detailCode);
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
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[10]),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[11]),
    					listen_dev(select, "change", /*change_handler*/ ctx[12], false, false, false),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[13]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[14]),
    					listen_dev(button0, "click", /*handleToggleHabit*/ ctx[8], false, false, false),
    					listen_dev(form, "submit", prevent_default(/*handleLocalSubmit*/ ctx[6]), false, true, false),
    					listen_dev(button2, "click", /*click_handler*/ ctx[16], false, false, false),
    					listen_dev(
    						button3,
    						"click",
    						function () {
    							if (is_function(/*handleAltAction*/ ctx[1])) /*handleAltAction*/ ctx[1].apply(this, arguments);
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

    			if (dirty & /*tempLocalUserHabit*/ 4 && input0.value !== /*tempLocalUserHabit*/ ctx[2].detailTitle) {
    				set_input_value(input0, /*tempLocalUserHabit*/ ctx[2].detailTitle);
    			}

    			if (dirty & /*$contentHabitDuration*/ 16) {
    				each_value_1 = /*$contentHabitDuration*/ ctx[4];
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

    			if (dirty & /*selected, $contentHabitDuration*/ 24) {
    				select_option(select, /*selected*/ ctx[3]);
    			}

    			if (dirty & /*tempLocalUserHabit*/ 4) {
    				set_input_value(textarea, /*tempLocalUserHabit*/ ctx[2].detailDescription);
    			}

    			if (dirty & /*tempLocalUserHabit*/ 4 && input1.value !== /*tempLocalUserHabit*/ ctx[2].detailCode) {
    				set_input_value(input1, /*tempLocalUserHabit*/ ctx[2].detailCode);
    			}

    			if (dirty & /*tempLocalUserHabit*/ 4) {
    				toggle_class(span7, "translate-x-5", /*tempLocalUserHabit*/ ctx[2].detailIsNewHabit);
    			}

    			if (dirty & /*tempLocalUserHabit*/ 4) {
    				toggle_class(button0, "bg-blue-900", /*tempLocalUserHabit*/ ctx[2].detailIsNewHabit);
    			}

    			if (current_block_type_2 !== (current_block_type_2 = select_block_type_2(ctx))) {
    				if_block2.d(1);
    				if_block2 = current_block_type_2(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(span8, null);
    				}
    			}

    			if (dirty & /*$contentHabitDetailCategory, tempLocalUserHabit*/ 36) {
    				each_value = /*$contentHabitDetailCategory*/ ctx[5];
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

    			if (dirty & /*altActionTitle*/ 1) set_data_dev(t40, /*altActionTitle*/ ctx[0]);
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
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(49:0) <ContentWrapper>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let contentwrapper;
    	let current;

    	contentwrapper = new ContentWrapper({
    			props: {
    				$$slots: { default: [create_default_slot$4] },
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

    			if (dirty & /*$$scope, handleAltAction, altActionTitle, $contentHabitDetailCategory, tempLocalUserHabit, selected, $contentHabitDuration*/ 67108927) {
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
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $activeUserHabits;
    	let $currentActiveHabit;
    	let $contentHabitDuration;
    	let $contentHabitDetailCategory;
    	validate_store(activeUserHabits, "activeUserHabits");
    	component_subscribe($$self, activeUserHabits, $$value => $$invalidate(17, $activeUserHabits = $$value));
    	validate_store(currentActiveHabit, "currentActiveHabit");
    	component_subscribe($$self, currentActiveHabit, $$value => $$invalidate(18, $currentActiveHabit = $$value));
    	validate_store(contentHabitDuration, "contentHabitDuration");
    	component_subscribe($$self, contentHabitDuration, $$value => $$invalidate(4, $contentHabitDuration = $$value));
    	validate_store(contentHabitDetailCategory, "contentHabitDetailCategory");
    	component_subscribe($$self, contentHabitDetailCategory, $$value => $$invalidate(5, $contentHabitDetailCategory = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AddEditDeleteHabit", slots, []);
    	let { altActionTitle } = $$props;
    	let { handleAltAction } = $$props;
    	let { handleSubmit } = $$props;
    	let tempLocalUserHabit = $activeUserHabits[$currentActiveHabit];

    	const handleLocalSubmit = () => {
    		tempUserHabit.set(tempLocalUserHabit);
    		handleSubmit();
    	};

    	const getNewDate = () => {
    		return new Date();
    	};

    	let selected;

    	const handleSelectDuration = option => {
    		let dateStart = getNewDate();
    		let dateEnd = getNewDate();
    		dateEnd.setDate(dateEnd.getDate() + option.value);
    		$$invalidate(2, tempLocalUserHabit.detailDateStartUTCString = dateStart.toUTCString(), tempLocalUserHabit);
    		$$invalidate(2, tempLocalUserHabit.detailDateEndUTCString = dateEnd.toUTCString(), tempLocalUserHabit);
    		$$invalidate(2, tempLocalUserHabit.detailDuration = option.value, tempLocalUserHabit);
    	};

    	const handleToggleHabit = () => {
    		$$invalidate(2, tempLocalUserHabit.detailIsNewHabit = !tempLocalUserHabit.detailIsNewHabit, tempLocalUserHabit);
    	};

    	onMount(() => {
    		handleSelectDuration($contentHabitDuration[0]);
    	});

    	const writable_props = ["altActionTitle", "handleAltAction", "handleSubmit"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AddEditDeleteHabit> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		tempLocalUserHabit.detailTitle = this.value;
    		$$invalidate(2, tempLocalUserHabit);
    	}

    	function select_change_handler() {
    		selected = select_value(this);
    		$$invalidate(3, selected);
    	}

    	const change_handler = () => handleSelectDuration(selected);

    	function textarea_input_handler() {
    		tempLocalUserHabit.detailDescription = this.value;
    		$$invalidate(2, tempLocalUserHabit);
    	}

    	function input1_input_handler() {
    		tempLocalUserHabit.detailCode = this.value;
    		$$invalidate(2, tempLocalUserHabit);
    	}

    	function input_change_handler(i) {
    		tempLocalUserHabit[`detailIsCategory${i + 1}`] = this.checked;
    		$$invalidate(2, tempLocalUserHabit);
    	}

    	const click_handler = () => push("/");

    	$$self.$$set = $$props => {
    		if ("altActionTitle" in $$props) $$invalidate(0, altActionTitle = $$props.altActionTitle);
    		if ("handleAltAction" in $$props) $$invalidate(1, handleAltAction = $$props.handleAltAction);
    		if ("handleSubmit" in $$props) $$invalidate(9, handleSubmit = $$props.handleSubmit);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		contentHabitDetailCategory,
    		contentHabitDuration,
    		currentActiveHabit,
    		activeUserHabits,
    		tempUserHabit,
    		push,
    		ContentWrapper,
    		AppHeader,
    		TwentyTwentyOne: _2021,
    		Modal,
    		altActionTitle,
    		handleAltAction,
    		handleSubmit,
    		tempLocalUserHabit,
    		handleLocalSubmit,
    		getNewDate,
    		selected,
    		handleSelectDuration,
    		handleToggleHabit,
    		$activeUserHabits,
    		$currentActiveHabit,
    		$contentHabitDuration,
    		$contentHabitDetailCategory
    	});

    	$$self.$inject_state = $$props => {
    		if ("altActionTitle" in $$props) $$invalidate(0, altActionTitle = $$props.altActionTitle);
    		if ("handleAltAction" in $$props) $$invalidate(1, handleAltAction = $$props.handleAltAction);
    		if ("handleSubmit" in $$props) $$invalidate(9, handleSubmit = $$props.handleSubmit);
    		if ("tempLocalUserHabit" in $$props) $$invalidate(2, tempLocalUserHabit = $$props.tempLocalUserHabit);
    		if ("selected" in $$props) $$invalidate(3, selected = $$props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		altActionTitle,
    		handleAltAction,
    		tempLocalUserHabit,
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

    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {
    			altActionTitle: 0,
    			handleAltAction: 1,
    			handleSubmit: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddEditDeleteHabit",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*altActionTitle*/ ctx[0] === undefined && !("altActionTitle" in props)) {
    			console.warn("<AddEditDeleteHabit> was created without expected prop 'altActionTitle'");
    		}

    		if (/*handleAltAction*/ ctx[1] === undefined && !("handleAltAction" in props)) {
    			console.warn("<AddEditDeleteHabit> was created without expected prop 'handleAltAction'");
    		}

    		if (/*handleSubmit*/ ctx[9] === undefined && !("handleSubmit" in props)) {
    			console.warn("<AddEditDeleteHabit> was created without expected prop 'handleSubmit'");
    		}
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

    /* src/routes/ScreenHabitAdd.svelte generated by Svelte v3.32.0 */

    const { console: console_1$5 } = globals;

    function create_fragment$d(ctx) {
    	let addeditdeletehabit;
    	let current;

    	addeditdeletehabit = new AddEditDeleteHabit({
    			props: {
    				altActionTitle: "Reset",
    				handleAltAction: /*handleReset*/ ctx[0],
    				handleSubmit: /*handleSubmitCreateNewHabit*/ ctx[1]
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
    		p: noop,
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
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $getUserHabitBlank;
    	let $API_ENDPOINT;
    	let $currentActiveHabit;
    	let $tempUserHabit;
    	let $activeUserId;
    	let $activeUserHabits;
    	validate_store(getUserHabitBlank, "getUserHabitBlank");
    	component_subscribe($$self, getUserHabitBlank, $$value => $$invalidate(2, $getUserHabitBlank = $$value));
    	validate_store(API_ENDPOINT, "API_ENDPOINT");
    	component_subscribe($$self, API_ENDPOINT, $$value => $$invalidate(3, $API_ENDPOINT = $$value));
    	validate_store(currentActiveHabit, "currentActiveHabit");
    	component_subscribe($$self, currentActiveHabit, $$value => $$invalidate(4, $currentActiveHabit = $$value));
    	validate_store(tempUserHabit, "tempUserHabit");
    	component_subscribe($$self, tempUserHabit, $$value => $$invalidate(5, $tempUserHabit = $$value));
    	validate_store(activeUserId, "activeUserId");
    	component_subscribe($$self, activeUserId, $$value => $$invalidate(6, $activeUserId = $$value));
    	validate_store(activeUserHabits, "activeUserHabits");
    	component_subscribe($$self, activeUserHabits, $$value => $$invalidate(7, $activeUserHabits = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ScreenHabitAdd", slots, []);

    	const handleReset = () => {
    		tempUserHabit.set($getUserHabitBlank());
    	};

    	const handleSubmitCreateNewHabit = async () => {
    		const fetchURL = $API_ENDPOINT + "/createNewHabit";

    		const fetchOptions = {
    			method: "POST",
    			headers: { "content-type": "application/json" },
    			body: JSON.stringify({
    				adminActivePosition: $currentActiveHabit,
    				adminIsActive: $tempUserHabit.adminIsActive,
    				adminUserId: $activeUserId,
    				adminHabitId: $tempUserHabit.adminHabitId,
    				adminSeriesId: $tempUserHabit.adminSeriesId,
    				adminScore: $tempUserHabit.adminScore,
    				adminIsSuccessful: $tempUserHabit.adminIsSuccessful,
    				detailIsCategory1: $tempUserHabit.detailIsCategory1,
    				detailIsCategory2: $tempUserHabit.detailIsCategory2,
    				detailIsCategory3: $tempUserHabit.detailIsCategory3,
    				detailCode: $tempUserHabit.detailCode,
    				detailDateEndUTCString: $tempUserHabit.detailDateEndUTCString,
    				detailDateStartUTCString: $tempUserHabit.detailDateStartUTCString,
    				detailDuration: $tempUserHabit.detailDuration,
    				detailDescription: $tempUserHabit.detailDescription,
    				detailIsNewHabit: $tempUserHabit.detailIsNewHabit,
    				detailTitle: $tempUserHabit.detailTitle,
    				checks: $tempUserHabit.checks,
    				messages: $tempUserHabit.messages
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
    			activeUserDetails.set(res.userDetails);
    			let newHabitData = $activeUserHabits;
    			newHabitData[$currentActiveHabit] = res.newHabit;
    			activeUserHabits.set(newHabitData);
    			isNewActiveUserHabit.set(true);
    		}).catch(err => {
    			console.clear();
    			errMessage.set(err);
    			push(`/error`);
    		});
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$5.warn(`<ScreenHabitAdd> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		errMessage,
    		API_ENDPOINT,
    		currentActiveHabit,
    		getUserHabitBlank,
    		isNewActiveUserHabit,
    		activeUserId,
    		activeUserDetails,
    		activeUserHabits,
    		tempUserHabit,
    		push,
    		AppHeader,
    		TwentyTwentyOne: _2021,
    		AddEditDeleteHabit,
    		handleReset,
    		handleSubmitCreateNewHabit,
    		$getUserHabitBlank,
    		$API_ENDPOINT,
    		$currentActiveHabit,
    		$tempUserHabit,
    		$activeUserId,
    		$activeUserHabits
    	});

    	return [handleReset, handleSubmitCreateNewHabit];
    }

    class ScreenHabitAdd extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScreenHabitAdd",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/routes/ScreenHabitEdit.svelte generated by Svelte v3.32.0 */

    const { console: console_1$6 } = globals;

    // (136:0) {#if habitDeleteWarning}
    function create_if_block$4(ctx) {
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				handleModal: /*handleModal*/ ctx[2],
    				contentModal: /*contentModal*/ ctx[1]
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
    		p: noop,
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
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(136:0) {#if habitDeleteWarning}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let addeditdeletehabit;
    	let t;
    	let if_block_anchor;
    	let current;

    	addeditdeletehabit = new AddEditDeleteHabit({
    			props: {
    				altActionTitle: "Delete",
    				handleAltAction: /*handleDelete*/ ctx[3],
    				handleSubmit: /*handleSubmitEditExistingHabit*/ ctx[4]
    			},
    			$$inline: true
    		});

    	let if_block = /*habitDeleteWarning*/ ctx[0] && create_if_block$4(ctx);

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
    					if_block = create_if_block$4(ctx);
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
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let $API_ENDPOINT;
    	let $tempUserHabit;
    	let $activeUserHabits;
    	let $currentActiveHabit;
    	let $getUserHabitBlank;
    	let $activeUserId;
    	validate_store(API_ENDPOINT, "API_ENDPOINT");
    	component_subscribe($$self, API_ENDPOINT, $$value => $$invalidate(5, $API_ENDPOINT = $$value));
    	validate_store(tempUserHabit, "tempUserHabit");
    	component_subscribe($$self, tempUserHabit, $$value => $$invalidate(6, $tempUserHabit = $$value));
    	validate_store(activeUserHabits, "activeUserHabits");
    	component_subscribe($$self, activeUserHabits, $$value => $$invalidate(7, $activeUserHabits = $$value));
    	validate_store(currentActiveHabit, "currentActiveHabit");
    	component_subscribe($$self, currentActiveHabit, $$value => $$invalidate(8, $currentActiveHabit = $$value));
    	validate_store(getUserHabitBlank, "getUserHabitBlank");
    	component_subscribe($$self, getUserHabitBlank, $$value => $$invalidate(9, $getUserHabitBlank = $$value));
    	validate_store(activeUserId, "activeUserId");
    	component_subscribe($$self, activeUserId, $$value => $$invalidate(10, $activeUserId = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ScreenHabitEdit", slots, []);

    	let contentModal = {
    		title: "Are You Sure You Want to Delete?",
    		details: "You will lose all data associated with this habit.",
    		button: "Delete Habit Data"
    	};

    	const handleModal = async () => {
    		const fetchURL = $API_ENDPOINT + "/deleteExistingHabit";

    		const fetchOptions = {
    			method: "POST",
    			headers: { "content-type": "application/json" },
    			body: JSON.stringify({
    				adminHabitId: $tempUserHabit.adminHabitId
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
    			// res = null
    			let newHabitData = $activeUserHabits;

    			newHabitData[$currentActiveHabit] = $getUserHabitBlank();
    			activeUserHabits.set(newHabitData);
    			isNewActiveUserHabit.set(true);
    		}).catch(err => {
    			console.clear();
    			errMessage.set(err);
    			push(`/error`);
    		});

    		$$invalidate(0, habitDeleteWarning = false);
    	};

    	let habitDeleteWarning = false;

    	const handleDelete = () => {
    		$$invalidate(0, habitDeleteWarning = true);
    		console.log("delete");
    	};

    	const handleSubmitEditExistingHabit = async () => {
    		const fetchURL = $API_ENDPOINT + "/editExistingHabit";

    		const fetchOptions = {
    			method: "POST",
    			headers: { "content-type": "application/json" },
    			body: JSON.stringify({
    				adminActivePosition: $currentActiveHabit,
    				adminIsActive: $tempUserHabit.adminIsActive,
    				adminUserId: $activeUserId,
    				adminHabitId: $tempUserHabit.adminHabitId,
    				adminSeriesId: $tempUserHabit.adminSeriesId,
    				adminScore: $tempUserHabit.adminScore,
    				adminIsSuccessful: $tempUserHabit.adminIsSuccessful,
    				detailIsCategory1: $tempUserHabit.detailIsCategory1,
    				detailIsCategory2: $tempUserHabit.detailIsCategory2,
    				detailIsCategory3: $tempUserHabit.detailIsCategory3,
    				detailCode: $tempUserHabit.detailCode,
    				detailDateEndUTCString: $tempUserHabit.detailDateEndUTCString,
    				detailDateStartUTCString: $tempUserHabit.detailDateStartUTCString,
    				detailDuration: $tempUserHabit.detailDuration,
    				detailDescription: $tempUserHabit.detailDescription,
    				detailIsNewHabit: $tempUserHabit.detailIsNewHabit,
    				detailTitle: $tempUserHabit.detailTitle,
    				checks: $tempUserHabit.checks,
    				messages: $tempUserHabit.messages
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
    			let newHabitData = $activeUserHabits;
    			newHabitData[$currentActiveHabit] = res.updatedHabit;
    			activeUserHabits.set(newHabitData);
    			isNewActiveUserHabit.set(true);
    		}).catch(err => {
    			console.clear();
    			errMessage.set(err);
    			push(`/error`);
    		});
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$6.warn(`<ScreenHabitEdit> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		errMessage,
    		API_ENDPOINT,
    		currentActiveHabit,
    		getUserHabitBlank,
    		isNewActiveUserHabit,
    		activeUserId,
    		activeUserHabits,
    		tempUserHabit,
    		push,
    		AppHeader,
    		TwentyTwentyOne: _2021,
    		Modal,
    		AddEditDeleteHabit,
    		contentModal,
    		handleModal,
    		habitDeleteWarning,
    		handleDelete,
    		handleSubmitEditExistingHabit,
    		$API_ENDPOINT,
    		$tempUserHabit,
    		$activeUserHabits,
    		$currentActiveHabit,
    		$getUserHabitBlank,
    		$activeUserId
    	});

    	$$self.$inject_state = $$props => {
    		if ("contentModal" in $$props) $$invalidate(1, contentModal = $$props.contentModal);
    		if ("habitDeleteWarning" in $$props) $$invalidate(0, habitDeleteWarning = $$props.habitDeleteWarning);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		habitDeleteWarning,
    		contentModal,
    		handleModal,
    		handleDelete,
    		handleSubmitEditExistingHabit
    	];
    }

    class ScreenHabitEdit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScreenHabitEdit",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/routes/ScreenHabitHistory.svelte generated by Svelte v3.32.0 */

    const { console: console_1$7 } = globals;
    const file$c = "src/routes/ScreenHabitHistory.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (11:4) {#if habit.adminIsActive || habit.adminIsSuccessful !== null}
    function create_if_block$5(ctx) {
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
    	let t3_value = /*habit*/ ctx[2].detailTitle + "";
    	let t3;
    	let t4;
    	let div6;
    	let t5;
    	let t6_value = /*habit*/ ctx[2].detailDateEndUTCString.slice(0, 16) + "";
    	let t6;
    	let t7;
    	let div7;
    	let t8;
    	let t9_value = /*habit*/ ctx[2].detailDateStartUTCString.slice(0, 16) + "";
    	let t9;
    	let t10;
    	let ul;
    	let t11;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*habit*/ ctx[2].detailDuration > 1) return create_if_block_7;
    		return create_else_block_3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*habit*/ ctx[2].detailCode) return create_if_block_6;
    		return create_else_block_2$2;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	function select_block_type_2(ctx, dirty) {
    		if (/*habit*/ ctx[2].adminSuccessful) return create_if_block_4$1;
    		if (/*habit*/ ctx[2].adminSuccessful == null) return create_if_block_5$1;
    		return create_else_block_1$3;
    	}

    	let current_block_type_2 = select_block_type_2(ctx);
    	let if_block2 = current_block_type_2(ctx);
    	let each_value_1 = /*habit*/ ctx[2].checks;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
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

    			t11 = space();
    			attr_dev(div0, "class", "relative uppercase font-extrabold text-gray-900 text-xs\n              text-left");
    			add_location(div0, file$c, 19, 12, 712);
    			attr_dev(div1, "class", "relative mt-1 text-6xl font-extrabold text-center\n              text-blue-900");
    			add_location(div1, file$c, 26, 12, 975);
    			attr_dev(div2, "class", "relative mt-2 text-sm font-bold text-center text-gray-900\n              uppercase");
    			add_location(div2, file$c, 31, 12, 1180);
    			attr_dev(div3, "class", "flex flex-col mx-auto");
    			add_location(div3, file$c, 18, 10, 664);
    			attr_dev(div4, "class", "w-1/3 py-1 px-2 ");
    			add_location(div4, file$c, 15, 8, 550);
    			attr_dev(div5, "class", "ml-2 pl-2 pt-3 ltext-xs font-extrabold text-gray-900\n            uppercase text-left");
    			add_location(div5, file$c, 51, 10, 1889);
    			attr_dev(div6, "class", "ml-2 pl-2 pt-0 text-xs font-extrabold text-gray-500 uppercase\n            text-left");
    			add_location(div6, file$c, 56, 10, 2059);
    			attr_dev(div7, "class", "ml-2 pl-2 text-xs font-extrabold text-gray-500 uppercase\n            text-left");
    			add_location(div7, file$c, 61, 10, 2259);
    			attr_dev(ul, "class", "ml-2 pt-1 place-items-center grid grid-cols-8 grid-cols-2\n            w-4/5 leading-tight");
    			add_location(ul, file$c, 66, 10, 2454);
    			attr_dev(div8, "class", "w-full");
    			add_location(div8, file$c, 50, 8, 1858);
    			attr_dev(div9, "class", "mx-auto flex py-1 border-2 border-blue-100 shadow rounded-sm\n        bg-white hover:bg-blue-200 focus:ring-2 focus:ring-offset-2\n        focus:ring-blue-900 focus:outline-none transition-colors duration-75");
    			add_location(div9, file$c, 11, 6, 314);
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

    			append_dev(div9, t11);

    			if (!mounted) {
    				dispose = listen_dev(div4, "click", /*click_handler*/ ctx[1], false, false, false);
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

    			if (dirty & /*$activeUserHabits*/ 1 && t3_value !== (t3_value = /*habit*/ ctx[2].detailTitle + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*$activeUserHabits*/ 1 && t6_value !== (t6_value = /*habit*/ ctx[2].detailDateEndUTCString.slice(0, 16) + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*$activeUserHabits*/ 1 && t9_value !== (t9_value = /*habit*/ ctx[2].detailDateStartUTCString.slice(0, 16) + "")) set_data_dev(t9, t9_value);

    			if (dirty & /*$activeUserHabits*/ 1) {
    				each_value_1 = /*habit*/ ctx[2].checks;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
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
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(11:4) {#if habit.adminIsActive || habit.adminIsSuccessful !== null}",
    		ctx
    	});

    	return block;
    }

    // (25:14) {:else}
    function create_else_block_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("24 Hours");
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
    		source: "(25:14) {:else}",
    		ctx
    	});

    	return block;
    }

    // (23:14) {#if habit.detailDuration > 1}
    function create_if_block_7(ctx) {
    	let t0_value = /*habit*/ ctx[2].detailDuration + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = text(" Days");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$activeUserHabits*/ 1 && t0_value !== (t0_value = /*habit*/ ctx[2].detailDuration + "")) set_data_dev(t0, t0_value);
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
    		source: "(23:14) {#if habit.detailDuration > 1}",
    		ctx
    	});

    	return block;
    }

    // (30:54) {:else}
    function create_else_block_2$2(ctx) {
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
    		id: create_else_block_2$2.name,
    		type: "else",
    		source: "(30:54) {:else}",
    		ctx
    	});

    	return block;
    }

    // (30:14) {#if habit.detailCode}
    function create_if_block_6(ctx) {
    	let t_value = /*habit*/ ctx[2].detailCode + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$activeUserHabits*/ 1 && t_value !== (t_value = /*habit*/ ctx[2].detailCode + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(30:14) {#if habit.detailCode}",
    		ctx
    	});

    	return block;
    }

    // (43:14) {:else}
    function create_else_block_1$3(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "fail";
    			attr_dev(span, "class", "bg-red-100 text-red-700 px-2 rounded-sm");
    			add_location(span, file$c, 43, 16, 1677);
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
    		id: create_else_block_1$3.name,
    		type: "else",
    		source: "(43:14) {:else}",
    		ctx
    	});

    	return block;
    }

    // (39:54) 
    function create_if_block_5$1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "active";
    			attr_dev(span, "class", "bg-blue-100 text-blue-700 px-2 rounded-sm");
    			add_location(span, file$c, 39, 16, 1533);
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
    		source: "(39:54) ",
    		ctx
    	});

    	return block;
    }

    // (35:14) {#if habit.adminSuccessful}
    function create_if_block_4$1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "success";
    			attr_dev(span, "class", "bg-green-100 text-green-700 py-1 px-2 rounded-sm");
    			add_location(span, file$c, 35, 16, 1348);
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
    		source: "(35:14) {#if habit.adminSuccessful}",
    		ctx
    	});

    	return block;
    }

    // (71:14) {#if i < 15}
    function create_if_block_2$3(ctx) {
    	let li;

    	function select_block_type_3(ctx, dirty) {
    		if (/*check*/ ctx[5].checkIsOk) return create_if_block_3$1;
    		return create_else_block$4;
    	}

    	let current_block_type = select_block_type_3(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			if_block.c();
    			add_location(li, file$c, 71, 16, 2657);
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
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(71:14) {#if i < 15}",
    		ctx
    	});

    	return block;
    }

    // (75:18) {:else}
    function create_else_block$4(ctx) {
    	let i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "bg-red-100 far fa-1x fa-window-close");
    			add_location(i, file$c, 75, 20, 2821);
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
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(75:18) {:else}",
    		ctx
    	});

    	return block;
    }

    // (73:18) {#if check.checkIsOk}
    function create_if_block_3$1(ctx) {
    	let i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "bg-green-100 far fa-1x fa-check-square");
    			add_location(i, file$c, 73, 20, 2722);
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
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(73:18) {#if check.checkIsOk}",
    		ctx
    	});

    	return block;
    }

    // (80:14) {#if i === 15}
    function create_if_block_1$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "...\n                ";
    			attr_dev(div, "class", "w-full text-xs font-extrabold text-gray-900 uppercase\n                  text-center");
    			add_location(div, file$c, 80, 16, 2983);
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
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(80:14) {#if i === 15}",
    		ctx
    	});

    	return block;
    }

    // (70:12) {#each habit.checks as check, i}
    function create_each_block_1$1(ctx) {
    	let t;
    	let if_block1_anchor;
    	let if_block0 = /*i*/ ctx[7] < 15 && create_if_block_2$3(ctx);
    	let if_block1 = /*i*/ ctx[7] === 15 && create_if_block_1$3(ctx);

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
    			if (/*i*/ ctx[7] < 15) if_block0.p(ctx, dirty);
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
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(70:12) {#each habit.checks as check, i}",
    		ctx
    	});

    	return block;
    }

    // (10:2) {#each $activeUserHabits as habit}
    function create_each_block$2(ctx) {
    	let if_block_anchor;
    	let if_block = (/*habit*/ ctx[2].adminIsActive || /*habit*/ ctx[2].adminIsSuccessful !== null) && create_if_block$5(ctx);

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
    			if (/*habit*/ ctx[2].adminIsActive || /*habit*/ ctx[2].adminIsSuccessful !== null) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(10:2) {#each $activeUserHabits as habit}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let div;
    	let div_intro;
    	let each_value = /*$activeUserHabits*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "pb-2 px-5 space-y-3 sm:w-full sm:max-w-md mt-8 mb-2 sm:mx-auto");
    			add_location(div, file$c, 5, 0, 115);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$activeUserHabits, console*/ 1) {
    				each_value = /*$activeUserHabits*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (!div_intro) {
    				add_render_callback(() => {
    					div_intro = create_in_transition(div, fade, {});
    					div_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
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
    	let $activeUserHabits;
    	validate_store(activeUserHabits, "activeUserHabits");
    	component_subscribe($$self, activeUserHabits, $$value => $$invalidate(0, $activeUserHabits = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ScreenHabitHistory", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$7.warn(`<ScreenHabitHistory> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => console.log("Habit button clicked");

    	$$self.$capture_state = () => ({
    		activeUserHabits,
    		fade,
    		$activeUserHabits
    	});

    	return [$activeUserHabits, click_handler];
    }

    class ScreenHabitHistory extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScreenHabitHistory",
    			options,
    			id: create_fragment$f.name
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

    	// Using named parameters, with last being optional
    	// "/author/:first/:last?": Author,
    	// Wildcard parameter
    	// "/book/*": Book,
    	// Catch-all
    	// This is optional, but if present it must be the last
    	// "*": NotFound,
    };

    /* src/App.svelte generated by Svelte v3.32.0 */

    const { console: console_1$8 } = globals;

    const file$d = "src/App.svelte";

    function create_fragment$g(ctx) {
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
    			add_location(div, file$d, 67, 0, 1667);
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
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let $getIsLocalStorage;
    	let $isLocalStorage;
    	let $LSisUserDefined;
    	let $LSuserDetails;
    	let $LSactiveHabits;
    	let $getUserHabitBlank;
    	let $activeUserAuth;
    	let $activeUserDetails;
    	let $activeUserHabits;
    	let $isActiveUserLive;
    	let $isNewActiveUserHabit;
    	validate_store(getIsLocalStorage, "getIsLocalStorage");
    	component_subscribe($$self, getIsLocalStorage, $$value => $$invalidate(2, $getIsLocalStorage = $$value));
    	validate_store(isLocalStorage, "isLocalStorage");
    	component_subscribe($$self, isLocalStorage, $$value => $$invalidate(3, $isLocalStorage = $$value));
    	validate_store(LSisUserDefined, "LSisUserDefined");
    	component_subscribe($$self, LSisUserDefined, $$value => $$invalidate(4, $LSisUserDefined = $$value));
    	validate_store(LSuserDetails, "LSuserDetails");
    	component_subscribe($$self, LSuserDetails, $$value => $$invalidate(5, $LSuserDetails = $$value));
    	validate_store(LSactiveHabits, "LSactiveHabits");
    	component_subscribe($$self, LSactiveHabits, $$value => $$invalidate(6, $LSactiveHabits = $$value));
    	validate_store(getUserHabitBlank, "getUserHabitBlank");
    	component_subscribe($$self, getUserHabitBlank, $$value => $$invalidate(7, $getUserHabitBlank = $$value));
    	validate_store(activeUserAuth, "activeUserAuth");
    	component_subscribe($$self, activeUserAuth, $$value => $$invalidate(8, $activeUserAuth = $$value));
    	validate_store(activeUserDetails, "activeUserDetails");
    	component_subscribe($$self, activeUserDetails, $$value => $$invalidate(9, $activeUserDetails = $$value));
    	validate_store(activeUserHabits, "activeUserHabits");
    	component_subscribe($$self, activeUserHabits, $$value => $$invalidate(10, $activeUserHabits = $$value));
    	validate_store(isActiveUserLive, "isActiveUserLive");
    	component_subscribe($$self, isActiveUserLive, $$value => $$invalidate(0, $isActiveUserLive = $$value));
    	validate_store(isNewActiveUserHabit, "isNewActiveUserHabit");
    	component_subscribe($$self, isNewActiveUserHabit, $$value => $$invalidate(1, $isNewActiveUserHabit = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	isLocalStorage.set($getIsLocalStorage());

    	if ($isLocalStorage && $LSisUserDefined) {
    		activeUserId.set($LSuserDetails.userId);
    		activeUserDetails.set($LSuserDetails);

    		let activeHabitsClean = $LSactiveHabits.map(habit => {
    			if (habit === null) {
    				return $getUserHabitBlank();
    			} else {
    				return habit;
    			}
    		});

    		while (activeHabitsClean.length < 3) {
    			activeHabitsClean.push($getUserHabitBlank());
    		}

    		activeUserHabits.set(activeHabitsClean);
    		replace("/");
    	} else {
    		replace("/start");
    	}

    	const updateLocalStorage = () => {
    		if ($isLocalStorage) {
    			LSuserAuth.set($activeUserAuth);
    			LSuserDetails.set($activeUserDetails);
    			LSactiveHabits.set($activeUserHabits);
    			LSisUserDefined.set(true);
    		}

    		isNewActiveUserHabit.set(false);
    		replace("/");
    	};

    	console.log("$activeUserHabits", $activeUserHabits);

    	onDestroy(() => {
    		isActiveUserLive.set(false);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$8.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onDestroy,
    		Router,
    		replace,
    		routes,
    		getIsLocalStorage,
    		isLocalStorage,
    		isActiveUserLive,
    		isNewActiveUserHabit,
    		activeUserAuth,
    		activeUserId,
    		activeUserDetails,
    		activeUserHabits,
    		getUserHabitBlank,
    		LSisUserDefined,
    		LSuserAuth,
    		LSuserDetails,
    		LSactiveHabits,
    		updateLocalStorage,
    		$getIsLocalStorage,
    		$isLocalStorage,
    		$LSisUserDefined,
    		$LSuserDetails,
    		$LSactiveHabits,
    		$getUserHabitBlank,
    		$activeUserAuth,
    		$activeUserDetails,
    		$activeUserHabits,
    		$isActiveUserLive,
    		$isNewActiveUserHabit
    	});

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$isActiveUserLive*/ 1) {
    			 $isActiveUserLive == true ? updateLocalStorage() : "";
    		}

    		if ($$self.$$.dirty & /*$isNewActiveUserHabit*/ 2) {
    			 $isNewActiveUserHabit == true
    			? updateLocalStorage()
    			: "";
    		}
    	};

    	return [$isActiveUserLive, $isNewActiveUserHabit];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$g.name
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
