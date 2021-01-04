
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function get_binding_group_value(group, __value, checked) {
        const value = new Set();
        for (let i = 0; i < group.length; i += 1) {
            if (group[i].checked)
                value.add(group[i].__value);
        }
        if (!checked) {
            value.delete(__value);
        }
        return Array.from(value);
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
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.0' }, detail)));
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

    /* node_modules/svelte-spa-router/Router.svelte generated by Svelte v3.31.0 */

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

    /* src/components/ContentWrapper.svelte generated by Svelte v3.31.0 */

    const file = "src/components/ContentWrapper.svelte";

    function create_fragment$1(ctx) {
    	let div1;
    	let div0;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "bg-white py-8 px-4 shadow rounded-sm sm:rounded-lg sm:px-10");
    			add_location(div0, file, 1, 2, 59);
    			attr_dev(div1, "class", "mt-8 mx-8 sm:mx-auto sm:w-full sm:max-w-md");
    			add_location(div1, file, 0, 0, 0);
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

    /* src/components/AppHeader.svelte generated by Svelte v3.31.0 */

    const file$1 = "src/components/AppHeader.svelte";

    function create_fragment$2(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let h2;
    	let t2;
    	let div1;
    	let p;
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
    			add_location(div0, file$1, 1, 2, 49);
    			attr_dev(h2, "class", "mt-6 text-center text-3xl font-extrabold text-gray-900");
    			add_location(h2, file$1, 4, 2, 108);
    			attr_dev(p, "class", "font-medium text-indigo-600 hover:text-indigo-500");
    			add_location(p, file$1, 8, 4, 274);
    			attr_dev(div1, "class", "mt-2 text-center text-sm text-gray-600 max-w");
    			add_location(div1, file$1, 7, 2, 211);
    			attr_dev(div2, "class", "sm:mx-auto sm:w-full sm:max-w-md");
    			add_location(div2, file$1, 0, 0, 0);
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

    /* src/svg/zero.svelte generated by Svelte v3.31.0 */

    const file$2 = "src/svg/zero.svelte";

    function create_fragment$3(ctx) {
    	let svg;
    	let g1;
    	let g0;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "d", "M258.11,2.84V399.11a2.28,2.28,0,0,1-.57,1.7l-15.35,15.35h-.56v.57H1.71l-.57-.57H.57v-.57L0,415v-398a.5.5,0,0,1,.57-.56v-.57L15.92.57h.57A1.65,1.65,0,0,1,17.63,0H257V.57h.57a.5.5,0,0,0,.57.57v1.7ZM20.47,9.1V392.29L29,383.76l21.61-21,4-4.55v-315Zm4-3.42,9.66,9.67,5.69,5.12L58.56,39.8H214.9l18.76-19.33,4.55-4.55,1.14-.57L249,5.68Zm0,390.58H36.39L70.5,362.15H58.56l-4,4L31.84,388.3Zm19.9,0H56.29L90.4,362.15H78.46ZM60.26,63.11V352.49L68.79,344l10.8-10.8.57-.57,9.67-9.67,4.55-4.54V83L87,76.18l-3.41-4L77.32,66l-4-4-5.69-5.68-4-4-3.42-3.41V63.11ZM70.5,44.91H64.24l3.41,3.41Zm93.24,277.45H98.36l-3.42,3.41-9.09,9.09-1.71,1.71-.57.57-12.5,12.5-6.83,6.83h145l-2.84-2.84-18.77-18.77-12.5-12.5Zm-99.5,73.9H76.18l34.11-34.11H98.36ZM90.4,44.91H78.46L71.07,52.3l2.84,2.28L77.32,58Zm19.89,0H98.36L81.3,62,87,68.22ZM84.14,396.26H96.08l34.11-34.11H118.25ZM130.19,44.91H118.25L91,72.2l6.26,5.69Zm28.43,55.15H100.06V316.67h58.56Zm-8.53-55.15H137.58L103.47,79.59H116ZM103.47,396.26H116l34.11-34.11H137.58ZM169.42,44.91H157.48L123.37,79.59h11.94Zm-46,351.35h11.94l34.11-34.11H157.48ZM189.32,44.91H177.38L143.27,79.59h11.94Zm-46,351.35h11.94l34.11-34.11H177.38ZM209.22,44.91H197.28L163.17,79.59h11.94l19.33-19.07,5.11-5.78ZM163.17,396.26h11.94l34.11-34.11H197.28Zm50-347.37L208.65,54l-5.12,4.55-5.68,5.68-9.1,9.1L179.09,83V318.38l18.76,19.33,5.68,5.11,9.67,9.67ZM183.07,396.26H195L221.73,369,216,363.29Zm43.77-22.17L225.71,373,203,396.26H214.9L232,379.21Zm26.15,4V9.1l-5.11,5.11-4.55,4.55-1.14,1.14-4.55,4.55L228,34.11l-9.1,9.1v315l18.76,18.76,5.69,5.69,9.66,9.67V378.07Zm-11.36,10.8-5.69-5.68-13.08,13.07H234.8Zm.56,7.39H249l-3.42-3.41Z");
    			add_location(path, file$2, 0, 142, 142);
    			attr_dev(g0, "id", "Layer_1-2");
    			attr_dev(g0, "data-name", "Layer 1");
    			add_location(g0, file$2, 0, 104, 104);
    			attr_dev(g1, "id", "Layer_2");
    			attr_dev(g1, "data-name", "Layer 2");
    			add_location(g1, file$2, 0, 68, 68);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 258.11 416.73");
    			add_location(svg, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g1);
    			append_dev(g1, g0);
    			append_dev(g0, path);
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
    	validate_slots("Zero", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Zero> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Zero extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Zero",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/svg/one.svelte generated by Svelte v3.31.0 */

    const file$3 = "src/svg/one.svelte";

    function create_fragment$4(ctx) {
    	let svg;
    	let g1;
    	let g0;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "d", "M139.29,2.27v398a.51.51,0,0,0-.57.57l-13.08,14.78a3.22,3.22,0,0,1-2.27,1.14H41.5a.5.5,0,0,1-.57-.57h-.56a.51.51,0,0,0-.57-.57V100.06h-37a.5.5,0,0,1-.57-.57H1.14l-.57-.57v-.56H0V17.05a.5.5,0,0,1,.57-.56v-.57L15.92.57h.57A1.64,1.64,0,0,1,17.62,0h120a.51.51,0,0,1,.57.57h.57a.5.5,0,0,0,.57.57V2.27ZM20.47,9.1V75L38.66,57.42l1.71-1.71v-.56l7.39-7.39,5.68-5.69-10.8-10.8Zm4-3.42,9.66,9.67,5.69,5.12L58.56,39.8H96.08l18.76-19.33,4.55-4.55,1.14-.57,9.66-9.67ZM36.39,79,70.5,44.91H58.56l-4,4-8,8.53-2.28,1.71-12.5,12.5L24.45,79Zm19.89,0L75.05,60.26l5.68-5.68,9.67-9.67H78.46L44.34,79Zm13.65-5.69L60.26,83V392.29l8.53-8.53L79.59,373l.57-.56,9.67-9.67,4.55-4.55V48.89L89.26,54l-4.55,4.55L79,64.24ZM64.24,396.26H76.18L102.9,369l-5.68-5.68-5.12,5.12-7.39,6.82-.57,1.14L83,377.5l-1.13.57Zm19.9,0H96.08l17.06-17.05L106.88,373Zm25-362.15-9.1,9.1v315l18.76,18.76,5.69,5.69,9.66,9.67V9.1l-5.11,5.11-4.55,4.55-1.14,1.14-4.55,4.55Zm-5.69,362.15h26.72l-2.84-2.84-10.23-10.23Z");
    			add_location(path, file$3, 0, 142, 142);
    			attr_dev(g0, "id", "Layer_1-2");
    			attr_dev(g0, "data-name", "Layer 1");
    			add_location(g0, file$3, 0, 104, 104);
    			attr_dev(g1, "id", "Layer_2");
    			attr_dev(g1, "data-name", "Layer 2");
    			add_location(g1, file$3, 0, 68, 68);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 139.29 416.73");
    			add_location(svg, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g1);
    			append_dev(g1, g0);
    			append_dev(g0, path);
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("One", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<One> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class One extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "One",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/svg/two.svelte generated by Svelte v3.31.0 */

    const file$4 = "src/svg/two.svelte";

    function create_fragment$5(ctx) {
    	let svg;
    	let g1;
    	let g0;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "d", "M258.11,2.84V241.05q0,.58-1.14,1.71L242.76,257v.57h-.57v.57H100.06v58.56h58.56V293.93l.57-.57L174.54,278a.51.51,0,0,0,.57-.57H257a.5.5,0,0,0,.57.57.5.5,0,0,0,.57.57v121.1a1.6,1.6,0,0,1-.57,1.13l-15.35,15.35h-.57v.57H1.71v-.57H.57v-.57A.51.51,0,0,0,0,415V175.11H.57v-.57l15.35-15.35h.57v-.57H158.62V100.06H100.06v21.6a1.2,1.2,0,0,1-.28.86,1.13,1.13,0,0,0-.29.85h-.57L84.14,138.72h-.57v.57H1.71a.5.5,0,0,1-.57-.57H.57v-.57L0,137.58V17.05l.57-.56v-.57L15.92.57h.57A2.32,2.32,0,0,1,18.19,0H257V.57h.57v.57h.57v1.7Zm-203.53,58V43.21L20.47,9.1V114.84l9.09-8.53,21-21,4-4.55V60.83ZM20.47,167.71V392.29l9.09-8.53L39.8,373l.57-.56,10.23-9.67,4-4.55V201.83Zm4-162,9.66,9.67H239.35L249,5.68ZM39.8,103.47l-1.14,1.14L24.45,118.82H36.39L63.67,92.1l-6.25-6.25L50,93.24l-.57.57-.57,1.13h-.57l-1.13,1.14ZM24.45,163.73l9.66,9.67,5.69,5.69,18.76,18.76H209.22L206.38,195l-19.9-19.89-11.37-11.38H24.45ZM70.5,362.15H58.56l-4,4-21,21-9.09,9.09H36.39ZM214.9,39.8l18.77-19.33H39.8L58.56,39.8Zm-141.56,62-5.69-6.26L44.34,118.82H56.28ZM90.4,362.15H78.46L44.34,396.26H56.28Zm4-253.56V83l-1.14-1.13L87,76.18l-3.41-4L77.32,66l-4-4-5.69-5.68-4-4-3.41-3.41V80.73L79,99.49l5.68,5.69,9.67,9.66ZM68.79,344l21-21,4.55-4.54V241.63l-7.4-7.4-3.41-4-6.25-5.68-4-4-5.69-6.25-4-3.42-3.41-3.41v145Zm1.71-299H64.24l3.41,3.41Zm-6.26,73.91H76.18l7.39-7.39-6.25-5.68Zm6.26,84.71H64.24l3.41,3.41ZM98.36,322.36l-4,4L84.14,336.57l-.57.57L71.63,349.07l-7.39,7.4h145l-2.84-2.84-19.9-19.9-11.37-11.37H98.36Zm11.93,39.79H98.36L64.24,396.26H76.18ZM90.4,44.91H78.46L71.63,52.3l2.28,2.28L77.32,58Zm0,158.62H78.46l-6.83,7.39,2.28,2.28,3.41,3.41Zm8-158.62L81.3,62l6.25,6.25,22.74-23.31Zm11.93,158.62H98.36L81.3,220.59l6.25,6.25ZM84.14,118.82H90.4L87.55,116l-.57-.57Zm46.05,243.33H118.25L84.14,396.26H96.08Zm0-317.24H118.25L91,72.2l6.26,5.69Zm0,158.62H118.25L91,230.25l6.26,6.26ZM104,79.59H116l34.11-34.68H138.15Zm0,158H116l34.11-34.11H138.15Zm46.05,124.51H138.15L104,396.26H116Zm7.39-317.24L123.37,79.59h12.51L170,44.91ZM170,203.53H157.48l-34.11,34.11h12.51Zm0,158.62H157.48l-34.11,34.11h12.51ZM155.21,79.59l34.11-34.68H177.38L143.27,79Zm34.11,123.94H177.38l-34.11,34.11h11.94Zm0,158.62H177.38l-34.11,34.11h11.94ZM175.11,79.59l19.33-19.07,2.27-2.89L199,55.89l.57-1.15,9.67-9.83H197.28L163.17,79Zm34.11,123.94H197.28l-34.11,34.11h11.94Zm0,158.62H197.28l-34.11,34.11h11.94ZM179.09,159.76l18.76,19.33,5.68,5.11,9.67,9.67v-145L208.65,54l-5.12,4.55-.57.57-2.27,2.27-2.84,2.84-9.1,9.1L179.09,83Zm0,126.78v31.84l18.76,19.33,5.68,5.11,9.67,9.67V320.65l-.57-.57-.57-.57-5.12-5.12Zm4-48.9H195l27.29-26.72L216,204.67Zm0,44.92,9.66,9.66,5.69,5.69L216,315.53l17.63-17.62,5.68-5.69,9.66-9.66Zm0,113.7H195L222.29,369,216,363.29Zm43.2-181.36-.56-.56L203,237.64H214.9l17.06-17Zm0,158.62-.56-.57L203,396.26H214.9L232,379.21ZM253,219.45V9.1l-5.12,5.11-4.55,4.55-1.14,1.14-4.55,4.55L228,34.11l-9.1,9.1V199.55l18.76,18.76,5.69,5.69,9.67,9.66V219.45Zm0,158.62V286.54l-5.12,5.11-4.55,4.55-.57.57-.57.57-4.55,4.55L228,311.55l-9.1,9.1v37.52l18.76,18.76,5.69,5.69,9.67,9.67V378.07ZM241.62,230.25l-5.68-5.68-13.08,13.07H234.8Zm0,158.62-5.68-5.68-13.08,13.07H234.8Zm1.71-151.23H249l-2.84-2.84-.57-.57-3.41,3.41Zm0,158.62H249l-2.84-2.84-.57-.57-3.41,3.41Z");
    			add_location(path, file$4, 0, 142, 142);
    			attr_dev(g0, "id", "Layer_1-2");
    			attr_dev(g0, "data-name", "Layer 1");
    			add_location(g0, file$4, 0, 104, 104);
    			attr_dev(g1, "id", "Layer_2");
    			attr_dev(g1, "data-name", "Layer 2");
    			add_location(g1, file$4, 0, 68, 68);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 258.11 416.73");
    			add_location(svg, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g1);
    			append_dev(g1, g0);
    			append_dev(g0, path);
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
    	validate_slots("Two", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Two> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Two extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Two",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/svg/three.svelte generated by Svelte v3.31.0 */

    const file$5 = "src/svg/three.svelte";

    function create_fragment$6(ctx) {
    	let svg;
    	let g1;
    	let g0;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "d", "M258.11,2.84V399.11a2.28,2.28,0,0,1-.57,1.7l-15.35,15.35h-.57v.57H1.71l-.57-.57H.57v-.57L0,415V333.73H.57v-1.14l15.35-14.78.57-.57a1.64,1.64,0,0,0,1.13-.57h141V258.11H1.14a.51.51,0,0,0-.57-.57V257a.5.5,0,0,1-.57-.56v-81.3H.57v-.57l15.35-15.35h.57v-.57H158.62V100.06H2.84a.5.5,0,0,1-.57-.57H1.14l-.57-.57v-.56H0V17.05a.5.5,0,0,1,.57-.56v-.57L15.92.57h.57A1.64,1.64,0,0,1,17.62,0H257V.57h.57a.5.5,0,0,0,.57.57v1.7ZM20.47,9.1V75L35.82,59.7,38.09,58l2.28-2.28,1.13-1.13,6.26-6.82,5.68-5.69-10.8-10.8Zm0,158.61v65.95L25,229.12l8.52-8.53L38.66,216l1.71-2.27,1.13-.57,4-4,2.85-3.41,5.11-5.12-10.8-10.8Zm0,158.63v66l6.82-6.83,7.39-7.39,1.14-1.14.57-.56,4-4,1.13-1.14.57-.57L43.78,369l5.68-5.68,4-4-10.8-10.8Zm4-320.66,9.66,9.67,5.69,5.12L58.56,39.8H214.9l18.77-19.33,5.68-5.12L249,5.68ZM70.5,44.91H58.56l-4,4.05L44.34,59.37l-.56.57L31.84,72.08l-7.39,7.51H36.39Zm-46,119.39,9.66,9.51,5.69,5.59,18.76,18.45H209.22l-2.84-2.8-19.9-19.56L175.11,164.3H24.45ZM70.5,203.53H58.56l-4,4L44.34,217.75l-.56.56L31.84,230.25l-7.39,7.39H36.39Zm-46,118.83L34.11,332l5.69,5.69,18.76,18.76H209.22l-2.84-2.84-19.9-19.9-11.37-11.37H24.45ZM70.5,362.15H58.56l-4,4L44.34,376.37l-.56.56L31.84,388.3l-7.39,8H36.39ZM90.4,44.91H78.46L44.34,79.59H56.28Zm0,158.62H78.46L44.34,237.64H56.28Zm0,158.62H78.46L44.34,396.26H56.28ZM110.29,44.91H98.36L64.24,79.59H76.18Zm0,158.62H98.36L64.24,237.64H76.18Zm0,158.62H98.36L64.24,396.26H76.18Zm19.9-317.24H118.25L84.14,79.59H96.08Zm0,158.62H118.25L84.14,237.64H96.08Zm0,158.62H118.25L84.14,396.26H96.08Zm19.9-317.24H137.58L103.47,79.59H116Zm0,158.62H137.58l-34.11,34.11H116Zm0,158.62H137.58l-34.11,34.11H116ZM169.42,44.91H157.48L123.37,79.59h11.94Zm0,158.62H157.48l-34.11,34.11h11.94Zm0,158.62H157.48l-34.11,34.11h11.94Zm19.9-317.24H177.38L143.27,79.59h11.94Zm0,158.62H177.38l-34.11,34.11h11.94Zm0,158.62H177.38l-34.11,34.11h11.94Zm19.9-317.24H197.28L163.17,79.59h11.94l19.33-19.07,2.27-2.89L199,55.89l.56-1.15L203,51.27Zm0,158.62H197.28l-34.11,34.11h11.94l19.33-18.76,2.27-2.84.57-.57,1.71-1.7.56-.57.57-.57,6.26-6.25Zm0,158.62H197.28l-34.11,34.11h11.94ZM179.09,159.76l18.76,19.33,5.68,5.11,9.67,9.67v-145l-3.41,3.41-5.12,5.12L203,59.13l-2.28,2.27-2.84,2.84-9.1,9.1L179.09,83Zm0,158.62,18.76,19.33,5.68,5.11,9.67,9.67v-145l-4.55,4.55-5.12,5.12H203v.57L200.69,220l-2.84,2.27-9.1,9.67-9.66,9.67Zm4,77.88H195L221.73,369,216,363.29Zm43.2-22.74-.57-.57L203,396.26H214.9L232,379.21ZM253,378.07V9.1l-5.12,5.11-4.55,4.55-.57.57-.57.57-4.54,4.55L228,34.11l-9.1,9.1v315l18.77,18.76,5.68,5.69,9.67,9.67V378.07Zm-11.38,10.8-5.68-5.68-13.08,13.07H234.8Zm.57,7.39H249l-2.85-2.84-.57-.57Z");
    			add_location(path, file$5, 0, 142, 142);
    			attr_dev(g0, "id", "Layer_1-2");
    			attr_dev(g0, "data-name", "Layer 1");
    			add_location(g0, file$5, 0, 104, 104);
    			attr_dev(g1, "id", "Layer_2");
    			attr_dev(g1, "data-name", "Layer 2");
    			add_location(g1, file$5, 0, 68, 68);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 258.11 416.73");
    			add_location(svg, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g1);
    			append_dev(g1, g0);
    			append_dev(g0, path);
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Three", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Three> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Three extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Three",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/svg/four.svelte generated by Svelte v3.31.0 */

    const file$6 = "src/svg/four.svelte";

    function create_fragment$7(ctx) {
    	let svg;
    	let g1;
    	let g0;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "d", "M258.11,240.49v79q0,1.71-.57,1.71v.57l-15.35,14.78v.57h-1.13v.57H218.88v61.4l-.56.57v.56l-.57.57L203,416.16h-.56l-.57.57h-81.3v-.57h-1.14V415h-.57V337.71H2.28l-.57-.57H1.14l-.57-.57V336H0V16.49H.57v-.57L15.92.57A2.33,2.33,0,0,1,17.63,0H98.36V.57h.57v.57h.56V2.27a.51.51,0,0,1,.57.57v234.8h18.76V17.05a.5.5,0,0,1,.57-.56v-.57L134.74.57A2.35,2.35,0,0,1,136.45,0h80.73a.5.5,0,0,0,.57.57v.57h.57v.57a.5.5,0,0,1,.56.56V237.64H257v.57h.56a.5.5,0,0,0,.57.57v1.71ZM20.47,9.1V313.26l8-8,11.94-11.94,1.7-2.27,9.67-9.67,2.84-2.27V43.21L54,42.64l-.57-.57-6.82-6.82-8-8Zm4-3.42,9.66,9.67,5.69,5.12L57.42,38.66,75.05,20.47l5.11-4.55.57-.57L90.4,5.68ZM70.5,282.56H58.56L33,308.57l-8.53,8.67H36.39Zm19.9,0H78.46L44.35,317.24H56.29Zm4-273.46L60.27,43.21V273.46L66,267.78,79,254.13l1.13-.57,1.71-2.27,8.53-8,4-4Zm4,234.23-4,4-19.9,19.9L64.24,277.44H169.42l-1.7-2.27-21.61-21.61-10.8-10.23H98.36Zm11.93,39.23H98.36L64.24,317.24H76.18Zm19.9,0H118.25L84.14,317.24H96.08ZM116,317.24l34.11-34.68h-12.5l-34.12,34.11Zm19.33,0,19.33-19.07,2.84-2.9v-.58l1.71-1.15.57-.58.57-.58,1.13-1.15,4-4,1.14-1.17,2.84-3.46H157.48l-34.11,34.11Zm4-308.14V239.35l19.33,18.76,5.12,5.69,9.66,9.66V43.21l-.57-.57-.56-.57-.57-.57ZM170,361.58l3.41-3.41V286.54l-9.1,9.09-.56.57-.57.57-2.84,2.84-1.71,2.28-10.23,9.66-9.1,9.1v71.64l9.67-9.67ZM143.27,5.68l9.66,9.67,5.69,5.12,17.62,18.19,18.2-18.19L199,15.92l.57-.57,9.67-9.67Zm0,390.58h11.94L182.5,369l-6.26-5.68-5.11,5.12L149.52,390Zm48.89-17.05L186.48,373l-23.31,23.31h11.94ZM213.2,9.1,179.09,43.21V273.46l5.68-5.68,13.08-13.65,1.13-.57,4.56-4.54,9.66-9.67Zm0,369V320.65l-7.39-6.82-3.41-4-6.26-6.26-4-4-5.68-5.68-4-4-3.41-3.41v71.63l18.76,18.76,5.69,5.69,9.66,9.67V378.07Zm4-134.74-4,4-19.9,19.9-10.23,10.23H214.9l18.77-19.33,5.68-5.12,9.67-9.66Zm-27.86,39.23h-6.25l3.41,3.41Zm-6.25,113.7H195l7.39-7.39-6.26-5.68Zm26.15-113.7H197.28L189.89,290l2.84,2.27,3.41,4Zm-9.1,17.05,5.69,6.26L221.73,290,216,283.7ZM203,396.26h6.26l-2.84-2.84-.57-.57Zm29-96.65-6.25-5.68-15.92,15.92,6.25,5.68Zm21-1.13V247.31l-4.55,4.55-5.12,4.55-.57.56-.57.57-4.55,4.55L220,280.29l17.62,17.62,5.69,5.68,9.67,9.67V298.48Zm-30.14,18.76,3.42-.57,8.52.57,6.83-6.82-5.69-6.26Zm19.33,0,1.14-.57,5.69.57-2.85-2.85h-.56Z");
    			add_location(path, file$6, 0, 142, 142);
    			attr_dev(g0, "id", "Layer_1-2");
    			attr_dev(g0, "data-name", "Layer 1");
    			add_location(g0, file$6, 0, 104, 104);
    			attr_dev(g1, "id", "Layer_2");
    			attr_dev(g1, "data-name", "Layer 2");
    			add_location(g1, file$6, 0, 68, 68);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 258.11 416.73");
    			add_location(svg, file$6, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g1);
    			append_dev(g1, g0);
    			append_dev(g0, path);
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
    	validate_slots("Four", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Four> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Four extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Four",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/svg/five.svelte generated by Svelte v3.31.0 */

    const file$7 = "src/svg/five.svelte";

    function create_fragment$8(ctx) {
    	let svg;
    	let g1;
    	let g0;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "d", "M258.11,2.84V121.66a2.29,2.29,0,0,1-.57,1.71l-15.35,15.35-.57.57H159.76v-.57h-.57l-.57-.57V100.06H100.06v58.56H257a.5.5,0,0,0,.57.57l.57.57V399.11a2.28,2.28,0,0,1-.57,1.7l-15.35,15.35h-.57v.57H1.71l-.57-.57H.57v-.57L0,415V293.93H.57v-.57L15.92,278h.57v-.57H98.36l.56.57.57.57v.57q.57,0,.57,1.14v36.38h58.56V258.11H1.14a.51.51,0,0,0-.57-.57V257a.5.5,0,0,1-.57-.56V17.05a.5.5,0,0,1,.57-.56v-.57L15.92.57h.57A1.64,1.64,0,0,1,17.62,0H257V.57h.57a.5.5,0,0,0,.57.57v1.7ZM20.47,9.1V233.66L29,225.14l10.81-10.8.57-.57L50.6,204.1l4-4.55V43.21Zm0,277.44V392.29L29,383.76l11.38-11.37,2.27-2.28L47.76,365l2.84-2.84,4-4V320.65l-.57-.57-.57-.57-8.53-9.09Zm4-280.86,9.66,9.67,5.69,5.12L58.56,39.8H214.9l18.77-19.33,4.54-4.55,1.14-.57L249,5.68ZM70.5,203.53H58.56l-4,4L31.84,230.25l-7.39,7.39H36.38Zm-46,79,9.66,9.66,5.69,5.69,17.62,17.62L75,297.91l5.69-5.69,9.67-9.66ZM70.5,362.15H58.56l-4,4-8,8-2.27,2.28-.57.56L31.84,388.3l-7.39,8H36.38ZM90.4,203.53H78.46L44.35,237.64H56.28Zm0,158.62H78.46L44.35,396.26H56.28ZM68.79,185.34l21-21,4.55-4.54V83L87,76.18l-3.41-4L77.32,66l-4-4-5.69-5.68-4-4-3.41-3.41v145ZM84.14,296.77v.57L79,301.89l-9.1,9.66-9.67,9.1v31.84L68.79,344l21-21,4.55-4.54V286.54l-5.12,5.11-4.55,4.55ZM70.5,44.91H64.24l3.41,3.41ZM98.36,163.73l-4,4L84.14,178.52h-.57L71.63,190.46l-7.39,7.39H214.9l18.77-18.76,4.54-4.55,1.14-1.14,9.67-9.67Zm11.93,39.8H98.36L64.24,237.64H76.18ZM98.36,322.36l-4,4L84.14,336.57l-.57.57L71.63,349.07l-7.39,7.4h145l-2.84-2.84-19.9-19.9-11.37-11.37H98.36Zm11.93,39.79H98.36L64.24,396.26H76.18ZM90.4,44.91H78.46L71.07,52.3l2.84,2.28L77.32,58Zm19.89,0H98.36L81.3,62,87,68.22Zm19.9,158.62H118.25L84.14,237.64H96.08Zm0,158.62H118.25L84.14,396.26H96.08Zm0-317.24H118.25L91,72.2l6.26,5.69ZM103.47,79.59H116l34.11-34.68H137.58Zm46.62,123.94H137.58l-34.11,34.11H116Zm0,158.62H137.58l-34.11,34.11H116ZM169.42,44.91H157.48L123.37,79.59h11.94Zm0,158.62H157.48l-34.11,34.11h11.94Zm0,158.62H157.48l-34.11,34.11h11.94ZM155.21,79.59l34.11-34.68H177.38L143.27,79.59Zm34.11,123.94H177.38l-34.11,34.11h11.94Zm0,158.62H177.38l-34.11,34.11h11.94ZM175.11,79.59l19.33-19.07L199,55.89l.57-1.15,9.67-9.83H197.28L163.17,79Zm34.11,123.94H197.28l-34.11,34.11h11.94l19.33-18.76,2.27-2.84,2.27-1.7v-.57l.57-.57Zm0,158.62H197.28l-34.11,34.11h11.94Zm4-313.26L208.65,54l-5.12,4.55-.57.57-2.27,2.27-2.84,2.84-9.1,9.1L179.09,83v31.84l8.53-8.53,21-21,4.55-4.55Zm-4.55,163.17-5.12,5.12-.57.57-5.11,4.54-9.1,9.67-9.66,9.67v76.75l18.76,19.33,5.68,5.11,9.67,9.67v-145Zm-25.58-93.24H195L221.72,92.1,216,85.85,210.92,91l-8,8-2.27,2.28Zm0,277.44H195L221.72,369,216,363.29ZM232,101.77l-6.25-6.26L203,118.82H214.9Zm-5.68,271.75-.57-.57L203,396.26H214.9L232,379.21ZM253,100.63V9.1l-5.11,5.11-4.55,4.55-1.14,1.14-4.55,4.55L228,34.11l-9.1,9.1V80.73l18.76,18.76,5.69,5.69,9.66,9.66V100.63Zm0,277.44V167.71l-5.11,5.12-4.55,4.55-1.14,1.14-4.55,4.55L228,192.16l-9.1,9.67V358.17l18.76,18.76,5.69,5.69,9.66,9.67V378.07ZM222.86,118.82H234.8l6.82-7.39-5.68-5.68Zm18.76,270.05-5.68-5.68-13.08,13.07H234.8Zm.57-270H249L246.17,116l-.57-.57Zm0,277.44H249l-2.85-2.84-.57-.57Z");
    			add_location(path, file$7, 0, 142, 142);
    			attr_dev(g0, "id", "Layer_1-2");
    			attr_dev(g0, "data-name", "Layer 1");
    			add_location(g0, file$7, 0, 104, 104);
    			attr_dev(g1, "id", "Layer_2");
    			attr_dev(g1, "data-name", "Layer 2");
    			add_location(g1, file$7, 0, 68, 68);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 258.11 416.73");
    			add_location(svg, file$7, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g1);
    			append_dev(g1, g0);
    			append_dev(g0, path);
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
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Five", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Five> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Five extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Five",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/svg/six.svelte generated by Svelte v3.31.0 */

    const file$8 = "src/svg/six.svelte";

    function create_fragment$9(ctx) {
    	let svg;
    	let g1;
    	let g0;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "d", "M258.11,2.84V121.66a2.29,2.29,0,0,1-.57,1.71l-15.35,15.35-.56.57H159.76v-.57h-.57l-.57-.57V100.06H100.06v58.56H257a.5.5,0,0,0,.57.57l.57.57V399.11a2.28,2.28,0,0,1-.57,1.7l-15.35,15.35h-.56v.57H1.71l-.57-.57H.57v-.57L0,415v-398a.5.5,0,0,1,.57-.56v-.57L15.92.57h.57A1.65,1.65,0,0,1,17.63,0H257V.57h.57a.5.5,0,0,0,.57.57v1.7ZM20.47,9.1V392.29L29,383.76l21.6-21,4-4.55v-315Zm4-3.42,9.66,9.67,5.69,5.12L58.56,39.8H214.9l18.76-19.33,4.55-4.55,1.14-.57L249,5.68Zm0,390.58H36.39L70.5,362.15H58.56l-4,4L31.84,388.3Zm19.89,0H56.29l34.1-34.11H78.46Zm45.49-232,4.55-4.54V83L87,76.18l-3.41-4L77.32,66l-4-4-5.68-5.68-4-4-3.42-3.41v145l8.53-8.53,10.8-10.8h.57ZM60.26,221.73V352.49L68.79,344l10.8-10.8.57-.57,9.67-9.67,4.55-4.54V241.63l-7.4-7.4-3.41-4-6.25-5.68-4-4-5.68-6.25-4-3.42-3.42-3.41v14.22ZM70.5,44.91H64.24l3.42,3.41ZM98.36,163.73l-4,4-8.53,8.53-1.71,2.28h-.57L71.63,190.46l-7.39,7.39H214.9l18.76-18.76,4.55-4.55,1.14-1.14,9.67-9.67ZM70.5,203.53H64.24l3.42,3.41Zm93.24,118.83H98.36l-4,4-8.53,8.52-1.71,1.71-.57.57L71.63,349.07l-7.39,7.4h145l-2.84-2.84-19.9-19.9-11.37-11.37Zm-99.5,73.9H76.18l34.11-34.11H98.36ZM90.39,44.91H78.46L71.07,52.3l2.84,2.28L77.32,58Zm0,158.62H78.46l-7.39,7.39,2.84,2.28,3.41,3.41Zm19.9-158.62H98.36L81.3,62,87,68.22Zm0,158.62H98.36L81.3,220.59,87,226.84ZM84.14,396.26H96.08l34.11-34.11H118.25ZM130.19,44.91H118.25L91,72.2l6.26,5.69Zm0,158.62H118.25L91,230.25l6.26,6.26Zm28.43,54.58H100.06v58.56h58.56ZM103.47,79.59H116l34.11-34.68H137.58Zm46.62,123.94H137.58l-34.11,34.11H116ZM103.47,396.26H116l34.11-34.11H137.58ZM169.42,44.91H157.48L123.37,79.59h11.94Zm0,158.62H157.48l-34.11,34.11h11.94Zm-46,192.73h11.94l34.11-34.11H157.48ZM155.21,79.59l34.11-34.68H177.38L143.27,79.59Zm34.11,123.94H177.38l-34.11,34.11h11.94Zm-46,192.73h11.94l34.11-34.11H177.38ZM175.11,79.59l19.33-19.07,5.11-5.78,9.67-9.83H197.28L163.17,79Zm34.11,123.94H197.28l-34.11,34.11h11.94l19.33-18.76,5.11-5.68ZM163.17,396.26h11.94l34.11-34.11H197.28Zm50-347.37L208.65,54l-5.12,4.55-5.68,5.68-9.1,9.1L179.09,83v31.84l8.52-8.53,10.81-10.8.56-.57,9.67-9.66,4.55-4.55Zm0,158.62-4.55,4.55-5.12,5.12-5.68,5.11-9.1,9.67-9.66,9.67v76.75l18.76,19.33,5.68,5.11,9.67,9.67ZM201.83,100.06l-1.14,1.14-17.62,17.62H195L221.73,92.1,216,85.85,210.92,91l-7.39,7.4-.57.56Zm-18.76,296.2H195L221.73,369,216,363.29ZM232,101.77l-6.25-6.26L203,118.82H214.9Zm-5.69,271.75-.56-.57L203,396.26H214.9L232,379.21ZM253,100.63V9.1l-5.11,5.11-4.55,4.55-1.14,1.14-4.55,4.55L228,34.11l-9.1,9.1V80.73l18.76,18.76,5.69,5.69,9.66,9.66V100.63Zm0,277.44V167.71l-5.11,5.12-4.55,4.55-1.14,1.14-4.55,4.55L228,192.16l-9.1,9.67V358.17l18.76,18.76,5.69,5.69,9.66,9.67V378.07ZM222.86,118.82H234.8l6.83-7.39-5.69-5.68Zm18.77,270.05-5.69-5.68-13.08,13.07H234.8Zm.56-270H249L246.17,116l-.57-.57Zm0,277.44H249l-2.85-2.84-.57-.57Z");
    			add_location(path, file$8, 0, 142, 142);
    			attr_dev(g0, "id", "Layer_1-2");
    			attr_dev(g0, "data-name", "Layer 1");
    			add_location(g0, file$8, 0, 104, 104);
    			attr_dev(g1, "id", "Layer_2");
    			attr_dev(g1, "data-name", "Layer 2");
    			add_location(g1, file$8, 0, 68, 68);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 258.11 416.73");
    			add_location(svg, file$8, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g1);
    			append_dev(g1, g0);
    			append_dev(g0, path);
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
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Six", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Six> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Six extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Six",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/svg/seven.svelte generated by Svelte v3.31.0 */

    const file$9 = "src/svg/seven.svelte";

    function create_fragment$a(ctx) {
    	let svg;
    	let g1;
    	let g0;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "d", "M258.11,2.84V399.11a2.28,2.28,0,0,1-.57,1.7l-15.35,15.35h-.56v.57H160.32l-.56-.57h-.57v-.57h-.57V258.11H80.73l-.57-.57-.57-.57v-1.13a.5.5,0,0,1-.56-.57v-79l.56-.56v-1.14h.57l14.78-15.35h.57v-.57h63.11V100.06H99.49v21.6a1.2,1.2,0,0,1-.28.86,1.13,1.13,0,0,0-.29.85h-.56l-14.7,15.35H83.1v.57H1.7a.5.5,0,0,1-.57-.57H.57v-.57L0,137.58V17.05l.57-.56v-.57L15.92.57h.57A2.32,2.32,0,0,1,18.19,0H257V.57h.57a.5.5,0,0,0,.57.57v1.7ZM54.58,43.39,20.47,9.1V115.41l9.09-8.57L39.8,96l.57-.56L50.6,85.69l4-4.58V43.39ZM24.45,5.68l9.66,9.67,5.69,5.12L58.56,39.8H214.9l18.76-19.33,5.12-4.55.57-.57L249,5.68Zm18.76,94.38-.57,1.14L24.45,118.82H36.38L63.68,92.1l-6.26-6.25L52.3,91l-6.82,7.4-1.13.56Zm30.13,1.71-5.69-6.26-23.3,23.31H56.28ZM94,109.1V83.3l-1.12-1.15-6.18-5.74-3.37-4L77.12,66.1l-3.94-4-5.61-5.74-3.94-4-3.37-3.44V81L78.79,99.93l5.62,5.74L94,115.41ZM70.5,44.91H64.24l3.41,3.41Zm-6.26,73.91H76.18l7.39-7.39-6.25-5.68ZM90.08,44.91H78.15L71.32,52.3l2.28,2.28L77,58Zm20.21,0H98.36L81.3,62l6.25,6.25ZM84,118.82h6.09L87.32,116l-.55-.57Zm46.2-73.91H118.25L91,72.2l6.26,5.69Zm-30.7,122.8v65.95L117.12,216l2.27-2.27.57-.57,6.82-6.82,5.69-5.69-10.81-10.8ZM104,79.59H116l34.11-34.68H138.15Zm0,84.71,9.67,9.51,5.11,5.59,19.33,18.45h71.07l-2.84-2.8-19.9-19.56L175.11,164.3H104Zm46.05,39.23H138.15l-4,4-8.53,8-2.27,2.28v.56l-11.94,11.94L104,237.64H116ZM170,44.91H157.48L123.37,79.59h12.51Zm0,158.62H157.48l-34.11,34.11h12.51ZM155.21,79.59l34.11-34.68H177.38L143.27,79.59Zm0,158,34.11-34.11H177.38l-34.11,34.11Zm19.9-158,19.33-19.07,5.11-5.78,9.67-9.83H197.28L163.17,79.59Zm0,158,19.33-18.76,1.7-2.27,2.28-2.27.56-.57,7.4-7.39,2.84-2.85H197.28l-34.11,34.11ZM213.2,48.89,208.65,54l-5.12,4.55-5.68,5.68-9.1,9.1L179.09,83v76.76l18.76,19.33,5.68,5.11,9.67,9.67ZM188.75,232l-9.66,9.67V392.29l8.52-8.53L198.42,373l.56-.56,9.67-9.67,4.55-4.55V207.51l-4.55,4.55-5.12,5.12-.57.57-5.11,4.54Zm-5.68,164.3H195L222.29,369,216,363.29l-5.12,5.12-7.39,6.82-.57,1.14-1.13,1.13-1.14.57ZM232,379.21,225.71,373,203,396.26H214.9Zm21-1.14V9.1l-5.11,5.11-4.55,4.55-1.14,1.14-4.55,4.55L228,34.11l-9.1,9.1v315l18.76,18.76,5.69,5.69,9.66,9.67V378.07Zm-30.13,18.19H234.8l6.83-7.39-5.69-5.68Zm19.33,0H249l-2.85-2.84-.57-.57Z");
    			add_location(path, file$9, 0, 142, 142);
    			attr_dev(g0, "id", "Layer_1-2");
    			attr_dev(g0, "data-name", "Layer 1");
    			add_location(g0, file$9, 0, 104, 104);
    			attr_dev(g1, "id", "Layer_2");
    			attr_dev(g1, "data-name", "Layer 2");
    			add_location(g1, file$9, 0, 68, 68);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 258.11 416.73");
    			add_location(svg, file$9, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g1);
    			append_dev(g1, g0);
    			append_dev(g0, path);
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
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Seven", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Seven> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Seven extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Seven",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/svg/eight.svelte generated by Svelte v3.31.0 */

    const file$a = "src/svg/eight.svelte";

    function create_fragment$b(ctx) {
    	let svg;
    	let g1;
    	let g0;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "d", "M258.11,2.84V162.6l-.57.57-15.35,15.35L220,200.69l37.52,37.52v.57h.57V400.24h-.57v.57l-15.35,15.35h-.56v.57H1.71l-.57-.57H.57v-.57L0,415V255.27a2.34,2.34,0,0,1,.57-1.71l15.35-14.78v-.57L38.66,216,.57,178.52A1.68,1.68,0,0,0,0,177.38V17.05a.5.5,0,0,1,.57-.56v-.57L15.92.57h.57A1.65,1.65,0,0,1,17.63,0H257V.57h.57v.57h.57v1.7ZM25,14.21,20.47,9.1V159.76L39.8,179.09l5.11,5.11,9.67,9.67V43.21L36.39,25l-4.55-4.55-5.69-5.12Zm.56,373L52.3,360.45l2.28-2.28V207.51l-1.71,2.28-7.39,6.82-.57.57-2.27,2.27-.57.57-2.27,2.27-9.1,9.1L20.47,241.63V392.29ZM24.45,5.68l4,3.42,5.68,6.25,5.69,5.12L51.17,31.84l7.39,8H214.9l18.76-19.33,4.55-4.55,1.14-.57L249,5.68Zm0,390.58H36.39L70.5,362.15H58.56Zm19.9,0H56.29L90.4,362.15H78.46ZM68.79,185.34,79,175.11h.56l.57-.57,2.28-2.28,7.39-8,4.55-4.54V83L87,76.18l-3.41-4L77.32,66l-4-4-5.69-5.68-4-4-3.42-3.41v145ZM91.53,321.22l2.85-2.84V241.63L84.14,231.39l-.57-1.14-6.25-5.68-4-4-5.69-6.25-4-3.42-3.42-3.41v145l5.12-5.12,14.21-14.21.57-.57ZM70.5,44.91H64.24l3.41,3.41Zm1.13,145.55-7.39,7.39h145L206.38,195l-19.9-19.89-11.37-11.38H98.36l-4,4-8.53,8.53-1.71,2.28h-.57ZM70.5,203.53H64.24l3.41,3.41Zm133,152.94h5.69l-1.71-1.71-24.44-25-8-7.39H98.36L87,333.73l-2.84,2.84-.57.57L64.24,356.47H203.53ZM64.24,396.26H76.18l34.11-34.11H98.36ZM90.4,44.91H78.46L71.07,52.3l2.84,2.28L77.32,58Zm0,158.62H78.46l-7.39,7.39,2.84,2.28,3.41,3.41ZM110.29,44.91H98.36L81.3,62,87,68.22Zm0,158.62H98.36L81.3,220.59,87,226.84ZM84.14,396.26H96.08l34.11-34.11H118.25ZM130.19,44.91H118.25L91,72.2l1.14.57,5.12,5.12Zm0,158.62H118.25L91,230.25l6.26,6.26Zm28.43-103.47H100.06v58.56h58.56ZM100.06,316.67h58.56V258.11H100.06Zm50-271.76H137.58L103.47,79.59,116,79Zm0,158.62H137.58l-34.11,34.11H116ZM103.47,396.26H116l34.11-34.11H137.58ZM169.42,44.91H157.48L123.37,79.59,135.31,79Zm0,158.62H157.48l-34.11,34.11h11.94Zm-46,192.73h11.94l34.11-34.11H157.48ZM189.32,44.91H177.38L143.27,79l11.94.56Zm0,158.62H177.38l-34.11,34.11h11.94Zm-46,192.73h11.94l34.11-34.11H177.38ZM209.22,44.91H197.28L163.17,79.59,175.11,79l19.33-18.77,5.11-5.68Zm0,158.62H197.28l-34.11,34.11h11.94l19.33-18.76,2.27-2.84.57-.57,1.14-1.13.56-.57.57-.57.57-.57.57-.57.57-.57,6.25-6.25ZM163.17,396.26h11.94l34.11-34.11H197.28Zm50-335.43V48.89l-5.69,5.69-4,4-5.68,5.68-8,8L179.09,83v76.76l18.76,19.33,5.68,5.11,9.67,9.67v-133Zm0,158.62V207.51l-3.41,2.85-5.69,6.25-.57.57-.57.57-.56.56-4.55,4-9.67,10.24-3.41,3.41-5.68,5.69v76.75l18.76,19.33,5.68,5.11,9.67,9.67v-133ZM183.07,396.26H195L221.73,369l-.57-.56L216,363.29Zm19.89,0H214.9L232,379.21,225.71,373ZM225.14,37l-6.26,6.26V193.87l5.12-5.12,13.64-13.64,5.69-5.69,9.66-9.66V9.1l-3.41,3.41-6.25,6.25-1.14,1.14-2.84,2.84-1.71,1.71ZM253,241.63l-27.28-27.29-4-3.42-2.85-3.41V358.17l18.76,18.76,5.69,5.69,9.66,9.67V241.63ZM222.86,396.26H234.8l6.83-7.39-5.69-5.68Zm19.33,0H249L246.74,394l-1.14-1.14Z");
    			add_location(path, file$a, 0, 142, 142);
    			attr_dev(g0, "id", "Layer_1-2");
    			attr_dev(g0, "data-name", "Layer 1");
    			add_location(g0, file$a, 0, 104, 104);
    			attr_dev(g1, "id", "Layer_2");
    			attr_dev(g1, "data-name", "Layer 2");
    			add_location(g1, file$a, 0, 68, 68);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 258.11 416.73");
    			add_location(svg, file$a, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g1);
    			append_dev(g1, g0);
    			append_dev(g0, path);
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
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Eight", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Eight> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Eight extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Eight",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/svg/nine.svelte generated by Svelte v3.31.0 */

    const file$b = "src/svg/nine.svelte";

    function create_fragment$c(ctx) {
    	let svg;
    	let g1;
    	let g0;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "d", "M258.11,2.84V399.11a2.28,2.28,0,0,1-.57,1.7l-15.35,15.35h-.56v.57H1.71l-.57-.57H.57v-.57L0,415V293.93H.57v-.57L15.92,278l.57-.57H98.36l.56.57.57.57v.57q.57,0,.57,1.14v36.38h58.56V258.11H1.14a.51.51,0,0,0-.57-.57V257a.5.5,0,0,1-.57-.56V17.05a.5.5,0,0,1,.57-.56v-.57L15.92.57h.57A1.65,1.65,0,0,1,17.63,0H257V.57h.57a.5.5,0,0,0,.57.57v1.7ZM20.47,9.1V233.66L29,225.14l21.61-21,4-4.55V43.21Zm0,277.44V392.29L29,383.76l21.61-21,4-4.55V320.65l-.57-.57-.57-.57-10.8-10.8Zm4-280.86,9.66,9.67,5.69,5.12L58.56,39.8H214.9l18.76-19.33,4.55-4.55,1.14-.57L249,5.68Zm0,232H36.39L70.5,203.53H58.56l-4,4L31.84,230.25Zm0,44.92,9.66,9.66,5.69,5.69,17.62,17.62L75,297.91l5.12-4.55.57-1.14,9.67-9.66ZM70.5,362.15H58.56l-4,4L31.84,388.3l-7.39,8H36.39ZM44.35,237.64H56.29L90.4,203.53H78.46ZM90.4,362.15H78.46L44.35,396.26H56.29Zm-30.14-299V193.87l8.53-8.53,10.8-10.8h.57l9.67-10.24,4.55-4.54V83L87,76.18l-3.41-4L77.32,66l-4-4-5.69-5.68-4-4-3.42-3.41V63.11Zm9.67,248.44-9.67,9.1v31.84L68.79,344l10.8-10.8.57-.57,9.67-9.67,4.55-4.54V286.54l-5.12,5.11-4.55,4.55-.57,1.14L79,301.89ZM70.5,44.91H64.24l3.41,3.41Zm133,152.94h5.69L206.38,195l-19.9-19.89-11.37-11.38H98.36l-4,4-8.53,8.53-1.71,2.28h-.57L71.63,190.46l-7.39,7.39H203.53ZM64.24,237.64H76.18l34.11-34.11H98.36Zm34.12,84.72-4,4-8.53,8.52-1.71,1.71-.57.57L71.63,349.07l-7.39,7.4h145l-2.84-2.84-19.9-19.9-11.37-11.37H98.36Zm11.93,39.79H98.36L64.24,396.26H76.18ZM90.4,44.91H78.46L71.07,52.3l2.84,2.28L77.32,58Zm19.89,0H98.36L81.3,62,87,68.22ZM84.14,237.64H96.08l34.11-34.11H118.25Zm46.05,124.51H118.25L84.14,396.26H96.08Zm0-317.24H118.25L91,72.2l6.26,5.69Zm28.43,55.15H100.06v58.56h58.56Zm-8.53-55.15H137.58L103.47,79.59H116ZM103.47,237.64H116l34.11-34.11H137.58Zm46.62,124.51H137.58l-34.11,34.11H116ZM169.42,44.91H157.48L123.37,79.59,135.31,79Zm-46,192.73h11.94l34.11-34.11H157.48Zm46,124.51H157.48l-34.11,34.11h11.94Zm19.9-317.24H177.38L143.27,79.59,155.21,79ZM155.21,237.64l34.11-34.11H177.38l-34.11,34.11Zm34.11,124.51H177.38l-34.11,34.11h11.94Zm19.9-317.24H197.28L163.17,79.59,175.11,79l19.33-18.77,5.11-5.68ZM175.11,237.64l19.33-18.76,2.27-2.84,2.27-2.27,7.4-7.39,2.84-2.85H197.28l-34.11,34.11Zm34.11,124.51H197.28l-34.11,34.11h11.94Zm4-313.26L208.65,54l-5.12,4.55-5.68,5.68-9.1,9.1L179.09,83v76.76l18.76,19.33,5.68,5.11,9.67,9.67Zm0,158.62-4.55,4.55-5.12,5.12-.57.57-5.11,4.54-9.1,9.67-9.66,9.67v76.75l18.76,19.33,5.68,5.11,9.67,9.67ZM183.07,396.26H195L221.73,369,216,363.29Zm43.2-22.74-.56-.57L203,396.26H214.9L232,379.21ZM253,378.07V9.1l-5.11,5.11-4.55,4.55-1.14,1.14-4.55,4.55L228,34.11l-9.1,9.1v315l18.76,18.76,5.69,5.69,9.66,9.67V378.07Zm-11.36,10.8-5.69-5.68-13.08,13.07H234.8Zm.56,7.39H249l-2.85-2.84-.57-.57Z");
    			add_location(path, file$b, 0, 142, 142);
    			attr_dev(g0, "id", "Layer_1-2");
    			attr_dev(g0, "data-name", "Layer 1");
    			add_location(g0, file$b, 0, 104, 104);
    			attr_dev(g1, "id", "Layer_2");
    			attr_dev(g1, "data-name", "Layer 2");
    			add_location(g1, file$b, 0, 68, 68);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 258.11 416.73");
    			add_location(svg, file$b, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g1);
    			append_dev(g1, g0);
    			append_dev(g0, path);
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
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Nine", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Nine> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Nine extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nine",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/components/Counter.svelte generated by Svelte v3.31.0 */

    const { console: console_1$1 } = globals;
    const file$c = "src/components/Counter.svelte";

    // (45:32) 
    function create_if_block_19(ctx) {
    	let nine;
    	let current;
    	nine = new Nine({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(nine.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(nine, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nine.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nine.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(nine, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_19.name,
    		type: "if",
    		source: "(45:32) ",
    		ctx
    	});

    	return block;
    }

    // (43:32) 
    function create_if_block_18(ctx) {
    	let eight;
    	let current;
    	eight = new Eight({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(eight.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(eight, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(eight.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(eight.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(eight, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_18.name,
    		type: "if",
    		source: "(43:32) ",
    		ctx
    	});

    	return block;
    }

    // (41:32) 
    function create_if_block_17(ctx) {
    	let seven;
    	let current;
    	seven = new Seven({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(seven.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(seven, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(seven.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(seven.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(seven, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_17.name,
    		type: "if",
    		source: "(41:32) ",
    		ctx
    	});

    	return block;
    }

    // (39:32) 
    function create_if_block_16(ctx) {
    	let six;
    	let current;
    	six = new Six({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(six.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(six, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(six.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(six.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(six, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16.name,
    		type: "if",
    		source: "(39:32) ",
    		ctx
    	});

    	return block;
    }

    // (37:32) 
    function create_if_block_15(ctx) {
    	let five;
    	let current;
    	five = new Five({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(five.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(five, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(five.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(five.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(five, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15.name,
    		type: "if",
    		source: "(37:32) ",
    		ctx
    	});

    	return block;
    }

    // (35:32) 
    function create_if_block_14(ctx) {
    	let four;
    	let current;
    	four = new Four({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(four.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(four, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(four.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(four.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(four, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(35:32) ",
    		ctx
    	});

    	return block;
    }

    // (33:32) 
    function create_if_block_13(ctx) {
    	let three;
    	let current;
    	three = new Three({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(three.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(three, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(three.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(three.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(three, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(33:32) ",
    		ctx
    	});

    	return block;
    }

    // (31:32) 
    function create_if_block_12(ctx) {
    	let two;
    	let current;
    	two = new Two({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(two.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(two, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(two.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(two.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(two, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(31:32) ",
    		ctx
    	});

    	return block;
    }

    // (29:32) 
    function create_if_block_11(ctx) {
    	let one;
    	let current;
    	one = new One({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(one.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(one, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(one.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(one.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(one, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(29:32) ",
    		ctx
    	});

    	return block;
    }

    // (27:2) {#if digits.first == '0' || digits.first == 'N'}
    function create_if_block_10(ctx) {
    	let zero;
    	let current;
    	zero = new Zero({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(zero.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(zero, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(zero.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(zero.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(zero, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(27:2) {#if digits.first == '0' || digits.first == 'N'}",
    		ctx
    	});

    	return block;
    }

    // (66:33) 
    function create_if_block_9(ctx) {
    	let nine;
    	let current;
    	nine = new Nine({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(nine.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(nine, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nine.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nine.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(nine, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(66:33) ",
    		ctx
    	});

    	return block;
    }

    // (64:33) 
    function create_if_block_8(ctx) {
    	let eight;
    	let current;
    	eight = new Eight({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(eight.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(eight, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(eight.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(eight.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(eight, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(64:33) ",
    		ctx
    	});

    	return block;
    }

    // (62:33) 
    function create_if_block_7(ctx) {
    	let seven;
    	let current;
    	seven = new Seven({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(seven.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(seven, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(seven.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(seven.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(seven, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(62:33) ",
    		ctx
    	});

    	return block;
    }

    // (60:33) 
    function create_if_block_6(ctx) {
    	let six;
    	let current;
    	six = new Six({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(six.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(six, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(six.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(six.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(six, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(60:33) ",
    		ctx
    	});

    	return block;
    }

    // (58:33) 
    function create_if_block_5(ctx) {
    	let five;
    	let current;
    	five = new Five({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(five.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(five, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(five.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(five.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(five, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(58:33) ",
    		ctx
    	});

    	return block;
    }

    // (56:33) 
    function create_if_block_4(ctx) {
    	let four;
    	let current;
    	four = new Four({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(four.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(four, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(four.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(four.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(four, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(56:33) ",
    		ctx
    	});

    	return block;
    }

    // (54:33) 
    function create_if_block_3(ctx) {
    	let three;
    	let current;
    	three = new Three({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(three.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(three, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(three.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(three.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(three, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(54:33) ",
    		ctx
    	});

    	return block;
    }

    // (52:33) 
    function create_if_block_2(ctx) {
    	let two;
    	let current;
    	two = new Two({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(two.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(two, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(two.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(two.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(two, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(52:33) ",
    		ctx
    	});

    	return block;
    }

    // (50:33) 
    function create_if_block_1(ctx) {
    	let one;
    	let current;
    	one = new One({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(one.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(one, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(one.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(one.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(one, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(50:33) ",
    		ctx
    	});

    	return block;
    }

    // (48:2) {#if digits.second == '0' || digits.first == 'a'}
    function create_if_block$1(ctx) {
    	let zero;
    	let current;
    	zero = new Zero({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(zero.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(zero, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(zero.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(zero.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(zero, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(48:2) {#if digits.second == '0' || digits.first == 'a'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block0;
    	let t;
    	let current_block_type_index_1;
    	let if_block1;
    	let current;

    	const if_block_creators = [
    		create_if_block_10,
    		create_if_block_11,
    		create_if_block_12,
    		create_if_block_13,
    		create_if_block_14,
    		create_if_block_15,
    		create_if_block_16,
    		create_if_block_17,
    		create_if_block_18,
    		create_if_block_19
    	];

    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*digits*/ ctx[0].first == "0" || /*digits*/ ctx[0].first == "N") return 0;
    		if (/*digits*/ ctx[0].first == "1") return 1;
    		if (/*digits*/ ctx[0].first == "2") return 2;
    		if (/*digits*/ ctx[0].first == "3") return 3;
    		if (/*digits*/ ctx[0].first == "4") return 4;
    		if (/*digits*/ ctx[0].first == "5") return 5;
    		if (/*digits*/ ctx[0].first == "6") return 6;
    		if (/*digits*/ ctx[0].first == "7") return 7;
    		if (/*digits*/ ctx[0].first == "8") return 8;
    		if (/*digits*/ ctx[0].first == "9") return 9;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const if_block_creators_1 = [
    		create_if_block$1,
    		create_if_block_1,
    		create_if_block_2,
    		create_if_block_3,
    		create_if_block_4,
    		create_if_block_5,
    		create_if_block_6,
    		create_if_block_7,
    		create_if_block_8,
    		create_if_block_9
    	];

    	const if_blocks_1 = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*digits*/ ctx[0].second == "0" || /*digits*/ ctx[0].first == "a") return 0;
    		if (/*digits*/ ctx[0].second == "1") return 1;
    		if (/*digits*/ ctx[0].second == "2") return 2;
    		if (/*digits*/ ctx[0].second == "3") return 3;
    		if (/*digits*/ ctx[0].second == "4") return 4;
    		if (/*digits*/ ctx[0].second == "5") return 5;
    		if (/*digits*/ ctx[0].second == "6") return 6;
    		if (/*digits*/ ctx[0].second == "7") return 7;
    		if (/*digits*/ ctx[0].second == "8") return 8;
    		if (/*digits*/ ctx[0].second == "9") return 9;
    		return -1;
    	}

    	if (~(current_block_type_index_1 = select_block_type_1(ctx))) {
    		if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div, "class", "svg-wrap flex svelte-rhxoxd");
    			add_location(div, file$c, 25, 0, 660);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div, null);
    			}

    			append_dev(div, t);

    			if (~current_block_type_index_1) {
    				if_blocks_1[current_block_type_index_1].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				if (if_block0) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block0 = if_blocks[current_block_type_index];

    					if (!if_block0) {
    						if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block0.c();
    					} else {
    						if_block0.p(ctx, dirty);
    					}

    					transition_in(if_block0, 1);
    					if_block0.m(div, t);
    				} else {
    					if_block0 = null;
    				}
    			}

    			let previous_block_index_1 = current_block_type_index_1;
    			current_block_type_index_1 = select_block_type_1(ctx);

    			if (current_block_type_index_1 !== previous_block_index_1) {
    				if (if_block1) {
    					group_outros();

    					transition_out(if_blocks_1[previous_block_index_1], 1, 1, () => {
    						if_blocks_1[previous_block_index_1] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index_1) {
    					if_block1 = if_blocks_1[current_block_type_index_1];

    					if (!if_block1) {
    						if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
    						if_block1.c();
    					} else {
    						if_block1.p(ctx, dirty);
    					}

    					transition_in(if_block1, 1);
    					if_block1.m(div, null);
    				} else {
    					if_block1 = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			if (~current_block_type_index_1) {
    				if_blocks_1[current_block_type_index_1].d();
    			}
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Counter", slots, []);
    	let { digits } = $$props;

    	onMount(() => {
    		console.log("digits:", digits);
    	});

    	const writable_props = ["digits"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Counter> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("digits" in $$props) $$invalidate(0, digits = $$props.digits);
    	};

    	$$self.$capture_state = () => ({
    		Zero,
    		One,
    		Two,
    		Three,
    		Four,
    		Five,
    		Six,
    		Seven,
    		Eight,
    		Nine,
    		onMount,
    		digits
    	});

    	$$self.$inject_state = $$props => {
    		if ("digits" in $$props) $$invalidate(0, digits = $$props.digits);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [digits];
    }

    class Counter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { digits: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Counter",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*digits*/ ctx[0] === undefined && !("digits" in props)) {
    			console_1$1.warn("<Counter> was created without expected prop 'digits'");
    		}
    	}

    	get digits() {
    		throw new Error("<Counter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set digits(value) {
    		throw new Error("<Counter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const tempUserDetailsData = {
    	name: "",
    	habit: "",
    	habitType: null,
    	habitCategory: [],
    	habitDateStartUTCString: "",
    	habitDateEndUTCString: "",
    };

    let activeUserDetailsData = {
    	name: "",
    	habit: "",
    	habitType: null,
    	habitCategory: [],
    	habitDateStartUTCString: "",
    	habitDateEndUTCString: "",
    };

    const fnIsLocalStorage = () => {
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

    const tempUserDetails = writable(tempUserDetailsData);
    const activeUserDetails = writable(activeUserDetailsData);

    const tempIsUserDefined = writable(false);
    const isLocalStorage = readable(fnIsLocalStorage);
    const errMessage = writable(null);

    /* src/routes/ScreenUser.svelte generated by Svelte v3.31.0 */
    const file$d = "src/routes/ScreenUser.svelte";

    // (37:0) <AppHeader>
    function create_default_slot_1(ctx) {
    	let counter;
    	let current;

    	counter = new Counter({
    			props: { digits: /*daysIn*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(counter.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(counter, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const counter_changes = {};
    			if (dirty & /*daysIn*/ 1) counter_changes.digits = /*daysIn*/ ctx[0];
    			counter.$set(counter_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(counter.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(counter.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(counter, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(37:0) <AppHeader>",
    		ctx
    	});

    	return block;
    }

    // (41:0) <ContentWrapper>
    function create_default_slot(ctx) {
    	let div1;
    	let p0;
    	let t0;
    	let t1_value = /*$activeUserDetails*/ ctx[2].name + "";
    	let t1;
    	let t2;
    	let t3;
    	let p1;
    	let t4;

    	let t5_value = (/*$activeUserDetails*/ ctx[2].habitType
    	? "start"
    	: "kick") + "";

    	let t5;
    	let t6;
    	let t7_value = /*$activeUserDetails*/ ctx[2].habit + "";
    	let t7;
    	let t8;
    	let t9_value = /*$activeUserDetails*/ ctx[2].habitDateStartUTCString + "";
    	let t9;
    	let t10;
    	let t11;
    	let p2;
    	let t12;
    	let t13_value = /*$activeUserDetails*/ ctx[2].habitDateEndUTCString + "";
    	let t13;
    	let t14;
    	let t15;
    	let div0;
    	let t16;
    	let t17;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			p0 = element("p");
    			t0 = text("Hey ");
    			t1 = text(t1_value);
    			t2 = text("!");
    			t3 = space();
    			p1 = element("p");
    			t4 = text("You have challenged yourself to ");
    			t5 = text(t5_value);
    			t6 = space();
    			t7 = text(t7_value);
    			t8 = text(". You made this decision here ");
    			t9 = text(t9_value);
    			t10 = text(".");
    			t11 = space();
    			p2 = element("p");
    			t12 = text("By ");
    			t13 = text(t13_value);
    			t14 = text(" you will have achieved your\n      twenty-one day goal.");
    			t15 = space();
    			div0 = element("div");
    			t16 = text(/*updateTime*/ ctx[1]);
    			t17 = text(" seconds");
    			attr_dev(p0, "class", "text-sm font-bold text-gray-700");
    			add_location(p0, file$d, 42, 4, 1234);
    			attr_dev(p1, "class", "text-sm font-medium text-gray-500 ");
    			add_location(p1, file$d, 45, 4, 1328);
    			attr_dev(p2, "class", "text-sm font-medium text-gray-500 ");
    			add_location(p2, file$d, 49, 4, 1584);
    			attr_dev(div0, "class", "text-center text-gray-300");
    			add_location(div0, file$d, 53, 4, 1751);
    			attr_dev(div1, "class", "space-y-6");
    			add_location(div1, file$d, 41, 2, 1206);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, p0);
    			append_dev(p0, t0);
    			append_dev(p0, t1);
    			append_dev(p0, t2);
    			append_dev(div1, t3);
    			append_dev(div1, p1);
    			append_dev(p1, t4);
    			append_dev(p1, t5);
    			append_dev(p1, t6);
    			append_dev(p1, t7);
    			append_dev(p1, t8);
    			append_dev(p1, t9);
    			append_dev(p1, t10);
    			append_dev(div1, t11);
    			append_dev(div1, p2);
    			append_dev(p2, t12);
    			append_dev(p2, t13);
    			append_dev(p2, t14);
    			append_dev(div1, t15);
    			append_dev(div1, div0);
    			append_dev(div0, t16);
    			append_dev(div0, t17);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$activeUserDetails*/ 4 && t1_value !== (t1_value = /*$activeUserDetails*/ ctx[2].name + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*$activeUserDetails*/ 4 && t5_value !== (t5_value = (/*$activeUserDetails*/ ctx[2].habitType
    			? "start"
    			: "kick") + "")) set_data_dev(t5, t5_value);

    			if (dirty & /*$activeUserDetails*/ 4 && t7_value !== (t7_value = /*$activeUserDetails*/ ctx[2].habit + "")) set_data_dev(t7, t7_value);
    			if (dirty & /*$activeUserDetails*/ 4 && t9_value !== (t9_value = /*$activeUserDetails*/ ctx[2].habitDateStartUTCString + "")) set_data_dev(t9, t9_value);
    			if (dirty & /*$activeUserDetails*/ 4 && t13_value !== (t13_value = /*$activeUserDetails*/ ctx[2].habitDateEndUTCString + "")) set_data_dev(t13, t13_value);
    			if (dirty & /*updateTime*/ 2) set_data_dev(t16, /*updateTime*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(41:0) <ContentWrapper>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
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

    			if (dirty & /*$$scope, daysIn*/ 513) {
    				appheader_changes.$$scope = { dirty, ctx };
    			}

    			appheader.$set(appheader_changes);
    			const contentwrapper_changes = {};

    			if (dirty & /*$$scope, updateTime, $activeUserDetails*/ 518) {
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
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let $activeUserDetails;
    	validate_store(activeUserDetails, "activeUserDetails");
    	component_subscribe($$self, activeUserDetails, $$value => $$invalidate(2, $activeUserDetails = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ScreenUser", slots, []);
    	let { params } = $$props;

    	const calDaysIn = (dateStart, dateToday) => {
    		let timeDiff = dateToday - dateStart;
    		timeDiff = (timeDiff / 1000 / 3600 / 24 + 1).toFixed(0);
    		timeDiff = timeDiff.toString().split("");

    		// console.log("diff", diff);
    		if (timeDiff.length == 1) {
    			return { first: 0, second: timeDiff[0] };
    		} else {
    			return { first: timeDiff[0], second: timeDiff[1] };
    		}
    	};

    	const update = setInterval(
    		() => {
    			$$invalidate(4, dateCurrent++, dateCurrent);
    		},
    		1000
    	);

    	let dateStart = new Date($activeUserDetails.habitDateStartUTCString).getTime();
    	let dateEnd = new Date($activeUserDetails.habitDateEndUTCString).getTime();
    	let dateCurrent = new Date().getTime();
    	let daysIn = calDaysIn(dateStart, dateCurrent);
    	let updateTime = dateEnd - dateCurrent;
    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ScreenUser> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("params" in $$props) $$invalidate(3, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		ContentWrapper,
    		AppHeader,
    		Counter,
    		activeUserDetails,
    		params,
    		calDaysIn,
    		update,
    		dateStart,
    		dateEnd,
    		dateCurrent,
    		daysIn,
    		updateTime,
    		$activeUserDetails
    	});

    	$$self.$inject_state = $$props => {
    		if ("params" in $$props) $$invalidate(3, params = $$props.params);
    		if ("dateStart" in $$props) $$invalidate(7, dateStart = $$props.dateStart);
    		if ("dateEnd" in $$props) $$invalidate(8, dateEnd = $$props.dateEnd);
    		if ("dateCurrent" in $$props) $$invalidate(4, dateCurrent = $$props.dateCurrent);
    		if ("daysIn" in $$props) $$invalidate(0, daysIn = $$props.daysIn);
    		if ("updateTime" in $$props) $$invalidate(1, updateTime = $$props.updateTime);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*dateCurrent*/ 16) {
    			 $$invalidate(1, updateTime = dateEnd - dateCurrent);
    		}

    		if ($$self.$$.dirty & /*dateCurrent*/ 16) {
    			 $$invalidate(0, daysIn = calDaysIn(dateStart, dateCurrent));
    		}
    	};

    	return [daysIn, updateTime, $activeUserDetails, params, dateCurrent];
    }

    class ScreenUser extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { params: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScreenUser",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*params*/ ctx[3] === undefined && !("params" in props)) {
    			console.warn("<ScreenUser> was created without expected prop 'params'");
    		}
    	}

    	get params() {
    		throw new Error("<ScreenUser>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<ScreenUser>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/svg/2021.svelte generated by Svelte v3.31.0 */

    const file$e = "src/svg/2021.svelte";

    function create_fragment$f(ctx) {
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
    			add_location(path0, file$e, 3, 6, 157);
    			attr_dev(path1, "d", "M544.64,2.84V399.11a2.32,2.32,0,0,1-.56,1.7l-15.36,15.35h-.56v.57H288.24l-.57-.57h-.57v-.57l-.57-.57v-398a.5.5,0,0,1,.57-.56v-.57L302.45.57H303A1.65,1.65,0,0,1,304.16,0H543.51V.57h.57a.5.5,0,0,0,.56.57v1.7ZM307,9.1V392.29l8.53-8.53,21.6-21,4-4.55v-315Zm4-3.42,9.66,9.67,5.69,5.12L345.09,39.8H501.44L520.2,20.47l4.55-4.55,1.13-.57,9.67-9.67Zm0,390.58h11.94L357,362.15H345.09l-4,4L318.37,388.3Zm19.9,0h11.94l34.11-34.11H365ZM346.8,63.11V352.49l8.52-8.53,10.81-10.8.56-.57,9.67-9.67,4.55-4.54V83l-7.39-6.82-3.41-4L363.85,66l-4-4-5.68-5.68-4-4-3.41-3.41V63.11ZM357,44.91h-6.25l3.41,3.41Zm93.24,277.45H384.89l-3.41,3.41-9.1,9.09-1.71,1.71-.56.57-12.51,12.5-6.82,6.83h145l-2.84-2.84-18.76-18.77-12.51-12.5Zm-99.49,73.9h11.93l34.12-34.11H384.89ZM376.93,44.91H365L357.6,52.3l2.84,2.28L363.85,58Zm19.9,0H384.89L367.83,62l5.69,6.25ZM370.67,396.26h11.94l34.11-34.11H404.79ZM416.72,44.91H404.79L377.5,72.2l6.25,5.69Zm28.43,55.15H386.59V316.67h58.56Zm-8.53-55.15h-12.5L390,79.59h12.51ZM390,396.26h12.51l34.11-34.11h-12.5ZM456,44.91H444L409.9,79.59h11.94ZM409.9,396.26h11.94L456,362.15H444Zm66-351.35H463.91L429.8,79.59h11.94ZM429.8,396.26h11.94l34.11-34.11H463.91ZM495.75,44.91H483.81L449.7,79.59h11.94L481,60.52l5.11-5.78ZM449.7,396.26h11.94l34.11-34.11H483.81Zm50-347.37L495.18,54l-5.11,4.55-5.69,5.68-9.1,9.1L465.62,83V318.38l18.76,19.33,5.69,5.11,9.66,9.67ZM469.6,396.26h11.94L508.26,369l-5.69-5.68Zm43.78-22.17L512.24,373,489.5,396.26h11.94l17.05-17.05Zm26.15,4V9.1l-5.12,5.11-4.55,4.55-1.14,1.14-4.54,4.55-9.67,9.66-9.09,9.1v315l18.76,18.76,5.68,5.69,9.67,9.67V378.07Zm-11.37,10.8-5.69-5.68L509.4,396.26h11.93Zm.56,7.39h6.83l-3.41-3.41Z");
    			add_location(path1, file$e, 5, 6, 3352);
    			attr_dev(path2, "d", "M830.61,2.84V241.05c0,.39-.38,1-1.13,1.71L815.26,257v.57h-.57v.57H672.56v58.56h58.56V293.93l.57-.57L747,278a.51.51,0,0,0,.57-.57h81.87a.5.5,0,0,0,.56.57.5.5,0,0,0,.57.57v121.1a1.6,1.6,0,0,1-.57,1.13l-15.35,15.35h-.56v.57H574.21v-.57h-1.14v-.57a.51.51,0,0,0-.57-.57V175.11h.57v-.57l15.35-15.35H589v-.57H731.12V100.06H672.56v21.6a1.2,1.2,0,0,1-.28.86,1.13,1.13,0,0,0-.29.85h-.57l-14.78,15.35h-.57v.57H574.21a.5.5,0,0,1-.57-.57h-.57v-.57l-.57-.57V17.05l.57-.56v-.57L588.42.57H589a2.32,2.32,0,0,1,1.7-.57H829.48V.57H830v.57h.57v1.7Zm-203.53,58V43.21L593,9.1V114.84l9.09-8.53,21-21,4-4.55V60.83ZM593,167.71V392.29l9.09-8.53L612.3,373l.57-.56,10.23-9.67,4-4.55V201.83Zm4-162,9.66,9.67H811.85l9.67-9.67Zm15.35,97.79-1.14,1.14L597,118.82h11.94L636.18,92.1l-6.26-6.25-7.39,7.39-.57.57-.57,1.13h-.56l-1.14,1.14ZM597,163.73l9.66,9.67,5.69,5.69,18.76,18.76H781.72L778.88,195,759,175.11l-11.37-11.38H597Zm46,198.42H631.06l-4,4-21,21L597,396.26h11.94ZM787.4,39.8l18.77-19.33H612.3L631.06,39.8Zm-141.56,62-5.68-6.26-23.31,23.31h11.94ZM662.9,362.15H651l-34.11,34.11h11.94Zm4-253.56V83l-1.14-1.13-6.25-5.69-3.42-4L649.82,66l-4-4-5.68-5.68-4-4-3.42-3.41V80.73l18.77,18.76,5.68,5.69,9.67,9.66ZM641.29,344l21-21,4.55-4.54V241.63l-7.39-7.4-3.42-4-6.25-5.68-4-4-5.68-6.25-4-3.42-3.42-3.41v145Zm1.71-299h-6.26l3.42,3.41Zm-6.26,73.91h11.94l7.39-7.39-6.25-5.68ZM643,203.53h-6.26l3.42,3.41Zm27.86,118.83-4,4-10.24,10.23-.57.57-11.93,11.93-7.4,7.4h145l-2.84-2.84L759,333.73l-11.37-11.37H670.86Zm11.93,39.79H670.86l-34.12,34.11h11.94ZM662.9,44.91H651l-6.82,7.39,2.27,2.28L649.82,58Zm0,158.62H651l-6.82,7.39,2.27,2.28,3.41,3.41Zm8-158.62L653.8,62l6.25,6.25,22.74-23.31Zm11.93,158.62H670.86L653.8,220.59l6.25,6.25Zm-26.15-84.71h6.26L660.05,116l-.56-.57Zm46.05,243.33H690.75l-34.11,34.11h11.94Zm0-317.24H690.75L663.46,72.2l6.26,5.69Zm0,158.62H690.75l-27.29,26.72,6.26,6.26ZM676.54,79.59h11.94l34.11-34.68H710.65Zm0,158h11.94l34.11-34.11H710.65Zm46.05,124.51H710.65l-34.11,34.11h11.94ZM730,44.91,695.87,79.59h12.51l34.11-34.68Zm12.51,158.62H730l-34.11,34.11h12.51Zm0,158.62H730l-34.11,34.11h12.51ZM727.71,79.59l34.11-34.68H749.88L715.77,79Zm34.11,123.94H749.88l-34.11,34.11h11.94Zm0,158.62H749.88l-34.11,34.11h11.94ZM747.61,79.59l19.33-19.07,2.27-2.89,2.28-1.74.56-1.15,9.67-9.83H769.78L735.67,79Zm34.11,123.94H769.78l-34.11,34.11h11.94Zm0,158.62H769.78l-34.11,34.11h11.94ZM751.59,159.76l18.76,19.33L776,184.2l9.67,9.67v-145L781.15,54,776,58.56l-.57.57-2.27,2.27-2.84,2.84-9.1,9.1L751.59,83Zm0,126.78v31.84l18.76,19.33,5.68,5.11,9.67,9.67V320.65l-.57-.57-.57-.57-5.11-5.12Zm4-48.9h11.94l27.28-26.72-6.25-6.25Zm0,44.92,9.66,9.66,5.69,5.69,17.62,17.62,17.63-17.62,5.68-5.69,9.67-9.66Zm0,113.7h11.94L794.79,369l-6.25-5.68Zm43.2-181.36-.56-.56-22.75,23.3H787.4l17.06-17Zm0,158.62-.56-.57-22.75,23.31H787.4l17.06-17.05ZM825.5,219.45V9.1l-5.12,5.11-4.55,4.55-1.14,1.14-4.54,4.55-9.67,9.66-9.1,9.1V199.55l18.77,18.76,5.68,5.69,9.67,9.66V219.45Zm0,158.62V286.54l-5.12,5.11-4.55,4.55-.57.57-.57.57-4.54,4.55-9.67,9.66-9.1,9.1v37.52l18.77,18.76,5.68,5.69,9.67,9.67V378.07ZM814.13,230.25l-5.69-5.68-13.08,13.07H807.3Zm0,158.62-5.69-5.68-13.08,13.07H807.3Zm1.7-151.23h5.69l-2.85-2.84-.57-.57-3.41,3.41Zm0,158.62h5.69l-2.85-2.84-.57-.57-3.41,3.41Z");
    			add_location(path2, file$e, 7, 6, 5009);
    			attr_dev(path3, "d", "M998.32,2.27v398a.51.51,0,0,0-.57.57l-13.07,14.78a3.26,3.26,0,0,1-2.28,1.14H900.54a.5.5,0,0,1-.57-.57h-.57a.51.51,0,0,0-.57-.57V100.06h-37a.5.5,0,0,1-.57-.57h-1.14l-.57-.57v-.56H859V17.05a.5.5,0,0,1,.57-.56v-.57L875,.57h.57A1.66,1.66,0,0,1,876.66,0h120a.51.51,0,0,1,.57.57h.56a.5.5,0,0,0,.57.57V2.27ZM879.5,9.1V75l18.19-17.62,1.71-1.71v-.56l7.39-7.39,5.68-5.69-10.8-10.8Zm4-3.42,9.66,9.67,5.69,5.12L917.59,39.8h37.52l18.77-19.33,4.54-4.55,1.14-.57,9.67-9.67ZM895.42,79l34.11-34.12H917.59l-4,4-8,8.53-2.27,1.71-12.51,12.5L883.48,79Zm19.9,0,18.76-18.77,5.68-5.68,9.67-9.67H937.49L903.38,79ZM929,73.34,919.3,83V392.29l8.53-8.53L938.63,373l.57-.56,9.66-9.67,4.55-4.55V48.89L948.29,54l-4.55,4.55-5.68,5.68Zm-5.68,322.92h11.94L961.94,369l-5.69-5.68-5.12,5.12-7.39,6.82-.56,1.14L942,377.5l-1.14.57Zm19.9,0h11.93l17.06-17.05L965.92,373Zm25-362.15-9.1,9.1v315l18.77,18.76,5.68,5.69,9.67,9.67V9.1l-5.12,5.11-4.55,4.55L982.4,19.9l-4.54,4.55ZM962.5,396.26h26.73l-2.85-2.84-10.23-10.23Z");
    			add_location(path3, file$e, 9, 6, 8239);
    			attr_dev(g0, "id", "Layer_1-2");
    			attr_dev(g0, "data-name", "Layer 1");
    			add_location(g0, file$e, 2, 4, 112);
    			attr_dev(g1, "id", "Layer_2");
    			attr_dev(g1, "data-name", "Layer 2");
    			add_location(g1, file$e, 1, 2, 71);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 998.32 416.73");
    			add_location(svg, file$e, 0, 0, 0);
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
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props) {
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
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_2021",
    			options,
    			id: create_fragment$f.name
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
          const unsubscribers = stores_array.map((store2, i) => store2.subscribe((value) => {
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
    const g = generator(window.localStorage);
    const writable$1 = g.writable;

    const LSuserAuthData = {
    	email: null,
    	password: null,
    };

    const LSuserDetailsData = {
    	name: "",
    	habit: "",
    	habitType: null,
    	habitCategory: [],
    	habitDateStartUTCString: "",
    	habitDateEndUTCString: "",
    };

    const LSuserAuth = writable$1("userAuth", LSuserAuthData);
    const LSuserDetails = writable$1("userDetails", LSuserDetailsData);
    const LSisUserDefined = writable$1("isUserDefined", false);

    /* src/routes/ScreenStart.svelte generated by Svelte v3.31.0 */

    const { console: console_1$2 } = globals;
    const file$f = "src/routes/ScreenStart.svelte";

    // (76:0) <AppHeader>
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
    		source: "(76:0) <AppHeader>",
    		ctx
    	});

    	return block;
    }

    // (80:0) <ContentWrapper>
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
    			add_location(label0, file$f, 82, 6, 2321);
    			attr_dev(input0, "id", "email");
    			attr_dev(input0, "name", "email");
    			attr_dev(input0, "type", "email");
    			attr_dev(input0, "autocomplete", "email");
    			input0.required = true;
    			attr_dev(input0, "class", "appearance-none block w-full px-3 py-2 border border-gray-300\n          rounded-md shadow-sm placeholder-gray-400 focus:outline-none\n          focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm");
    			add_location(input0, file$f, 86, 8, 2459);
    			attr_dev(div0, "class", "mt-1");
    			add_location(div0, file$f, 85, 6, 2432);
    			add_location(div1, file$f, 81, 4, 2309);
    			attr_dev(label1, "for", "password");
    			attr_dev(label1, "class", "block text-sm font-medium text-gray-700");
    			add_location(label1, file$f, 100, 6, 2883);
    			attr_dev(input1, "id", "password");
    			attr_dev(input1, "name", "password");
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "autocomplete", "password");
    			input1.required = true;
    			attr_dev(input1, "class", "appearance-none block w-full px-3 py-2 border border-gray-300\n          rounded-md shadow-sm placeholder-gray-400 focus:outline-none\n          focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm");
    			add_location(input1, file$f, 104, 8, 3019);
    			attr_dev(div2, "class", "mt-1");
    			add_location(div2, file$f, 103, 6, 2992);
    			add_location(div3, file$f, 99, 4, 2871);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "w-full flex justify-center py-2 px-4 border border-transparent\n        rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600\n        hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2\n        focus:ring-indigo-500");
    			add_location(button, file$f, 118, 6, 3458);
    			add_location(div4, file$f, 117, 4, 3446);
    			attr_dev(form, "class", "space-y-6");
    			add_location(form, file$f, 80, 2, 2240);
    			attr_dev(div5, "class", "w-full border-t border-gray-300");
    			add_location(div5, file$f, 132, 8, 3917);
    			attr_dev(div6, "class", "absolute inset-0 flex items-center");
    			add_location(div6, file$f, 131, 6, 3860);
    			attr_dev(span0, "class", "px-2 bg-white text-gray-500");
    			add_location(span0, file$f, 135, 8, 4043);
    			attr_dev(div7, "class", "relative flex justify-center text-sm");
    			add_location(div7, file$f, 134, 6, 3984);
    			attr_dev(div8, "class", "relative");
    			add_location(div8, file$f, 130, 4, 3831);
    			attr_dev(span1, "class", "");
    			add_location(span1, file$f, 146, 10, 4412);
    			attr_dev(a0, "href", "#/signup");
    			attr_dev(a0, "class", "w-full inline-flex justify-center py-2 px-4 border\n          border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium\n          text-gray-500 hover:bg-gray-50");
    			add_location(a0, file$f, 141, 8, 4186);
    			add_location(div9, file$f, 140, 6, 4172);
    			attr_dev(span2, "class", "");
    			add_location(span2, file$f, 156, 10, 4714);
    			attr_dev(a1, "href", "#/about");
    			attr_dev(a1, "class", "w-full inline-flex justify-center py-2 px-4 border\n          border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium\n          text-gray-500 hover:bg-gray-50");
    			add_location(a1, file$f, 151, 8, 4489);
    			add_location(div10, file$f, 150, 6, 4475);
    			attr_dev(div11, "class", "mt-6 grid grid-cols-2 gap-3");
    			add_location(div11, file$f, 139, 4, 4124);
    			attr_dev(div12, "class", "mt-6");
    			add_location(div12, file$f, 129, 2, 3808);
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
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(80:0) <ContentWrapper>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
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
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let $isLocalStorage;
    	let $LSuserAuth;
    	let $LSuserDetails;
    	let $LSisUserDefined;
    	validate_store(isLocalStorage, "isLocalStorage");
    	component_subscribe($$self, isLocalStorage, $$value => $$invalidate(4, $isLocalStorage = $$value));
    	validate_store(LSuserAuth, "LSuserAuth");
    	component_subscribe($$self, LSuserAuth, $$value => $$invalidate(5, $LSuserAuth = $$value));
    	validate_store(LSuserDetails, "LSuserDetails");
    	component_subscribe($$self, LSuserDetails, $$value => $$invalidate(6, $LSuserDetails = $$value));
    	validate_store(LSisUserDefined, "LSisUserDefined");
    	component_subscribe($$self, LSisUserDefined, $$value => $$invalidate(7, $LSisUserDefined = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ScreenStart", slots, []);
    	let userTemp = { email: "", password: "" };

    	const handleSignIn = async () => {
    		const fetchURL = "https://sanderjson-pr-2021-days.builtwithdark.com/signInUser";

    		const fetchOptions = {
    			method: "POST",
    			headers: { "content-type": "application/json" },
    			body: JSON.stringify({
    				email: userTemp.email.toLocaleLowerCase(),
    				password: userTemp.password
    			})
    		};

    		const postData = await fetch(fetchURL, fetchOptions).then(res => res.json()).then(res => {
    			if (res.Error) {
    				errMessage.set(res.Error);
    				push(`#/error`);
    			} else {
    				if ($isLocalStorage()) {
    					console.log("start before LSuserAuth", $LSuserAuth);
    					console.log("start before LSuserDetails", $LSuserDetails);
    					console.log("start before LSisUserDefined", $LSisUserDefined);
    					LSuserAuth.set(res.userAuth);
    					LSuserDetails.set(res.userDetails);
    					LSisUserDefined.set(true);
    					console.log("start after LSuserAuth", $LSuserAuth);
    					console.log("start after LSuserDetails", $LSuserDetails);
    					console.log("start after LSisUserDefined", $LSisUserDefined);
    				} else {
    					tempUserDetails.set(res.userDetails); // console.log("local storage is enabled");
    					tempIsUserDefined.set(true);
    				} // console.log("local storage is not available");
    			}
    		}).catch(err => {
    			errMessage.set(res.Error);
    			push(`#/error`);
    		});
    	};

    	onMount(() => {
    		tempIsUserDefined.set(false);
    		LSisUserDefined.set(false);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<ScreenStart> was created with unknown prop '${key}'`);
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
    		tempIsUserDefined,
    		tempUserDetails,
    		isLocalStorage,
    		errMessage,
    		LSisUserDefined,
    		LSuserAuth,
    		LSuserDetails,
    		userTemp,
    		handleSignIn,
    		$isLocalStorage,
    		$LSuserAuth,
    		$LSuserDetails,
    		$LSisUserDefined
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
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScreenStart",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src/routes/ScreenSignUp.svelte generated by Svelte v3.31.0 */

    const { console: console_1$3 } = globals;
    const file$g = "src/routes/ScreenSignUp.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (125:0) <AppHeader>
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
    		source: "(125:0) <AppHeader>",
    		ctx
    	});

    	return block;
    }

    // (225:51) {:else}
    function create_else_block$1(ctx) {
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
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(225:51) {:else}",
    		ctx
    	});

    	return block;
    }

    // (225:10) {#if userTemp.habitType}
    function create_if_block$2(ctx) {
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
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(225:10) {#if userTemp.habitType}",
    		ctx
    	});

    	return block;
    }

    // (240:10) {#each contentHabitsInfo as habit}
    function create_each_block(ctx) {
    	let div2;
    	let div0;
    	let input;
    	let input_value_value;
    	let input_id_value;
    	let input_name_value;
    	let t0;
    	let div1;
    	let label;
    	let t1_value = /*habit*/ ctx[14].title + "";
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*habit*/ ctx[14].content + "";
    	let t3;
    	let t4;
    	let mounted;
    	let dispose;

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
    			input.__value = input_value_value = /*habit*/ ctx[14].type;
    			input.value = input.__value;
    			attr_dev(input, "id", input_id_value = /*habit*/ ctx[14].type);
    			attr_dev(input, "name", input_name_value = /*habit*/ ctx[14].type);
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "class", "focus:ring-indigo-500 h-4 w-4 text-indigo-600\n                  border-gray-300 rounded");
    			/*$$binding_groups*/ ctx[9][0].push(input);
    			add_location(input, file$g, 242, 16, 7744);
    			attr_dev(div0, "class", "flex items-center h-5");
    			add_location(div0, file$g, 241, 14, 7692);
    			attr_dev(label, "for", "comments");
    			attr_dev(label, "class", "font-medium text-gray-700");
    			add_location(label, file$g, 252, 16, 8141);
    			attr_dev(p, "class", "text-gray-500");
    			add_location(p, file$g, 255, 16, 8271);
    			attr_dev(div1, "class", "ml-3 text-sm");
    			add_location(div1, file$g, 251, 14, 8098);
    			attr_dev(div2, "class", "relative flex items-start");
    			add_location(div2, file$g, 240, 12, 7638);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, input);
    			input.checked = ~/*userTemp*/ ctx[0].habitCategory.indexOf(input.__value);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, label);
    			append_dev(label, t1);
    			append_dev(div1, t2);
    			append_dev(div1, p);
    			append_dev(p, t3);
    			append_dev(div2, t4);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[8]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*userTemp*/ 1) {
    				input.checked = ~/*userTemp*/ ctx[0].habitCategory.indexOf(input.__value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			/*$$binding_groups*/ ctx[9][0].splice(/*$$binding_groups*/ ctx[9][0].indexOf(input), 1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(240:10) {#each contentHabitsInfo as habit}",
    		ctx
    	});

    	return block;
    }

    // (129:0) <ContentWrapper>
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
    	let div8;
    	let button0;
    	let span0;
    	let t13;
    	let span1;
    	let t14;
    	let span3;
    	let span2;
    	let t15;
    	let div10;
    	let fieldset;
    	let legend;
    	let t16;
    	let span4;
    	let t18;
    	let t19;
    	let div9;
    	let t20;
    	let div11;
    	let button1;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*userTemp*/ ctx[0].habitType) return create_if_block$2;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);
    	let each_value = /*contentHabitsInfo*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

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
    			label1.textContent = "Email address";
    			t4 = space();
    			div2 = element("div");
    			input1 = element("input");
    			t5 = space();
    			div5 = element("div");
    			label2 = element("label");
    			label2.textContent = "Password";
    			t7 = space();
    			div4 = element("div");
    			input2 = element("input");
    			t8 = space();
    			div7 = element("div");
    			label3 = element("label");
    			label3.textContent = "Habit";
    			t10 = space();
    			div6 = element("div");
    			input3 = element("input");
    			t11 = space();
    			div8 = element("div");
    			button0 = element("button");
    			span0 = element("span");
    			span0.textContent = "Use setting";
    			t13 = space();
    			span1 = element("span");
    			t14 = space();
    			span3 = element("span");
    			span2 = element("span");
    			if_block.c();
    			t15 = space();
    			div10 = element("div");
    			fieldset = element("fieldset");
    			legend = element("legend");
    			t16 = text("Habit category\n          ");
    			span4 = element("span");
    			span4.textContent = "(check any that apply)";
    			t18 = text("\n          :");
    			t19 = space();
    			div9 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t20 = space();
    			div11 = element("div");
    			button1 = element("button");
    			button1.textContent = "Sign Up";
    			attr_dev(label0, "for", "email");
    			attr_dev(label0, "class", "block text-sm font-medium text-gray-700");
    			add_location(label0, file$g, 131, 6, 3845);
    			attr_dev(input0, "id", "name");
    			attr_dev(input0, "name", "name");
    			attr_dev(input0, "type", "name");
    			attr_dev(input0, "autocomplete", "name");
    			input0.required = true;
    			attr_dev(input0, "class", "appearance-none block w-full px-3 py-2 border border-gray-300\n          rounded-md shadow-sm placeholder-gray-400 focus:outline-none\n          focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm");
    			add_location(input0, file$g, 135, 8, 3974);
    			attr_dev(div0, "class", "mt-1");
    			add_location(div0, file$g, 134, 6, 3947);
    			add_location(div1, file$g, 130, 4, 3833);
    			attr_dev(label1, "for", "email");
    			attr_dev(label1, "class", "block text-sm font-medium text-gray-700");
    			add_location(label1, file$g, 149, 6, 4393);
    			attr_dev(input1, "id", "email");
    			attr_dev(input1, "name", "email");
    			attr_dev(input1, "type", "email");
    			attr_dev(input1, "autocomplete", "email");
    			input1.required = true;
    			attr_dev(input1, "class", "appearance-none block w-full px-3 py-2 border border-gray-300\n          rounded-md shadow-sm placeholder-gray-400 focus:outline-none\n          focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm");
    			add_location(input1, file$g, 153, 8, 4531);
    			attr_dev(div2, "class", "mt-1");
    			add_location(div2, file$g, 152, 6, 4504);
    			add_location(div3, file$g, 148, 4, 4381);
    			attr_dev(label2, "for", "password");
    			attr_dev(label2, "class", "block text-sm font-medium text-gray-700");
    			add_location(label2, file$g, 167, 6, 4955);
    			attr_dev(input2, "id", "password");
    			attr_dev(input2, "name", "password");
    			attr_dev(input2, "type", "password");
    			attr_dev(input2, "autocomplete", "password");
    			input2.required = true;
    			attr_dev(input2, "class", "appearance-none block w-full px-3 py-2 border border-gray-300\n          rounded-md shadow-sm placeholder-gray-400 focus:outline-none\n          focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm");
    			add_location(input2, file$g, 171, 8, 5091);
    			attr_dev(div4, "class", "mt-1");
    			add_location(div4, file$g, 170, 6, 5064);
    			add_location(div5, file$g, 166, 4, 4943);
    			attr_dev(label3, "for", "password");
    			attr_dev(label3, "class", "block text-sm font-medium text-gray-700");
    			add_location(label3, file$g, 185, 6, 5530);
    			attr_dev(input3, "id", "habit");
    			attr_dev(input3, "name", "habit");
    			attr_dev(input3, "type", "habit");
    			attr_dev(input3, "autocomplete", "habit");
    			input3.required = true;
    			attr_dev(input3, "class", "appearance-none block w-full px-3 py-2 border border-gray-300\n          rounded-md shadow-sm placeholder-gray-400 focus:outline-none\n          focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm");
    			add_location(input3, file$g, 189, 8, 5663);
    			attr_dev(div6, "class", "mt-1");
    			add_location(div6, file$g, 188, 6, 5636);
    			add_location(div7, file$g, 184, 4, 5518);
    			attr_dev(span0, "class", "sr-only");
    			add_location(span0, file$g, 214, 8, 6633);
    			attr_dev(span1, "aria-hidden", "true");
    			attr_dev(span1, "class", "translate-x-5 inline-block h-5 w-5 rounded-full bg-white shadow\n          transform ring-0 transition ease-in-out duration-200");
    			toggle_class(span1, "translate-x-5", /*userTemp*/ ctx[0].habitType);
    			add_location(span1, file$g, 216, 8, 6741);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "aria-pressed", "false");
    			attr_dev(button0, "aria-labelledby", "toggleLabel");
    			attr_dev(button0, "class", "bg-gray-200 relative inline-flex flex-shrink-0 h-6 w-11 border-2\n        border-transparent rounded-full cursor-pointer transition-colors\n        ease-in-out duration-200 focus:outline-none focus:ring-2\n        focus:ring-offset-2 focus:ring-indigo-500");
    			toggle_class(button0, "bg-indigo-600", /*userTemp*/ ctx[0].habitType);
    			add_location(button0, file$g, 204, 6, 6168);
    			attr_dev(span2, "class", "text-sm font-medium text-gray-900");
    			add_location(span2, file$g, 223, 8, 7042);
    			attr_dev(span3, "class", "ml-3");
    			attr_dev(span3, "id", "toggleLabel");
    			add_location(span3, file$g, 222, 6, 6997);
    			attr_dev(div8, "class", "flex items-center");
    			add_location(div8, file$g, 202, 4, 6075);
    			attr_dev(span4, "class", "text-sm text-gray-500");
    			add_location(span4, file$g, 235, 10, 7448);
    			attr_dev(legend, "class", "block text-sm font-medium text-gray-700");
    			add_location(legend, file$g, 233, 8, 7356);
    			attr_dev(div9, "class", "mt-4 space-y-4");
    			add_location(div9, file$g, 238, 8, 7552);
    			add_location(fieldset, file$g, 232, 6, 7337);
    			attr_dev(div10, "class", "mt-6");
    			add_location(div10, file$g, 231, 4, 7312);
    			attr_dev(button1, "type", "submit");
    			attr_dev(button1, "class", "w-full flex justify-center py-2 px-4 border border-transparent\n        rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600\n        hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2\n        focus:ring-indigo-500");
    			add_location(button1, file$g, 264, 6, 8435);
    			add_location(div11, file$g, 263, 4, 8423);
    			attr_dev(form, "class", "space-y-6");
    			add_location(form, file$g, 129, 2, 3764);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div1);
    			append_dev(div1, label0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, input0);
    			set_input_value(input0, /*userTemp*/ ctx[0].name);
    			append_dev(form, t2);
    			append_dev(form, div3);
    			append_dev(div3, label1);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, input1);
    			set_input_value(input1, /*userTemp*/ ctx[0].email);
    			append_dev(form, t5);
    			append_dev(form, div5);
    			append_dev(div5, label2);
    			append_dev(div5, t7);
    			append_dev(div5, div4);
    			append_dev(div4, input2);
    			set_input_value(input2, /*userTemp*/ ctx[0].password);
    			append_dev(form, t8);
    			append_dev(form, div7);
    			append_dev(div7, label3);
    			append_dev(div7, t10);
    			append_dev(div7, div6);
    			append_dev(div6, input3);
    			set_input_value(input3, /*userTemp*/ ctx[0].habit);
    			append_dev(form, t11);
    			append_dev(form, div8);
    			append_dev(div8, button0);
    			append_dev(button0, span0);
    			append_dev(button0, t13);
    			append_dev(button0, span1);
    			append_dev(div8, t14);
    			append_dev(div8, span3);
    			append_dev(span3, span2);
    			if_block.m(span2, null);
    			append_dev(form, t15);
    			append_dev(form, div10);
    			append_dev(div10, fieldset);
    			append_dev(fieldset, legend);
    			append_dev(legend, t16);
    			append_dev(legend, span4);
    			append_dev(legend, t18);
    			append_dev(fieldset, t19);
    			append_dev(fieldset, div9);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div9, null);
    			}

    			append_dev(form, t20);
    			append_dev(form, div11);
    			append_dev(div11, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[5]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[6]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[7]),
    					listen_dev(button0, "click", /*handleToggleHabitType*/ ctx[3], false, false, false),
    					listen_dev(form, "submit", prevent_default(/*handleSignUp*/ ctx[2]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*userTemp*/ 1) {
    				set_input_value(input0, /*userTemp*/ ctx[0].name);
    			}

    			if (dirty & /*userTemp*/ 1 && input1.value !== /*userTemp*/ ctx[0].email) {
    				set_input_value(input1, /*userTemp*/ ctx[0].email);
    			}

    			if (dirty & /*userTemp*/ 1 && input2.value !== /*userTemp*/ ctx[0].password) {
    				set_input_value(input2, /*userTemp*/ ctx[0].password);
    			}

    			if (dirty & /*userTemp*/ 1) {
    				set_input_value(input3, /*userTemp*/ ctx[0].habit);
    			}

    			if (dirty & /*userTemp*/ 1) {
    				toggle_class(span1, "translate-x-5", /*userTemp*/ ctx[0].habitType);
    			}

    			if (dirty & /*userTemp*/ 1) {
    				toggle_class(button0, "bg-indigo-600", /*userTemp*/ ctx[0].habitType);
    			}

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(span2, null);
    				}
    			}

    			if (dirty & /*contentHabitsInfo, userTemp*/ 3) {
    				each_value = /*contentHabitsInfo*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div9, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			if_block.d();
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(129:0) <ContentWrapper>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
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

    			if (dirty & /*$$scope*/ 131072) {
    				appheader_changes.$$scope = { dirty, ctx };
    			}

    			appheader.$set(appheader_changes);
    			const contentwrapper_changes = {};

    			if (dirty & /*$$scope, userTemp*/ 131073) {
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
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let $isLocalStorage;
    	let $LSuserAuth;
    	let $LSuserDetails;
    	let $LSisUserDefined;
    	validate_store(isLocalStorage, "isLocalStorage");
    	component_subscribe($$self, isLocalStorage, $$value => $$invalidate(10, $isLocalStorage = $$value));
    	validate_store(LSuserAuth, "LSuserAuth");
    	component_subscribe($$self, LSuserAuth, $$value => $$invalidate(11, $LSuserAuth = $$value));
    	validate_store(LSuserDetails, "LSuserDetails");
    	component_subscribe($$self, LSuserDetails, $$value => $$invalidate(12, $LSuserDetails = $$value));
    	validate_store(LSisUserDefined, "LSisUserDefined");
    	component_subscribe($$self, LSisUserDefined, $$value => $$invalidate(13, $LSisUserDefined = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ScreenSignUp", slots, []);

    	const contentHabitsInfo = [
    		{
    			title: "Physical Habit",
    			type: "physical",
    			content: "Walking, running, exercise, improved posture, quit smoking, stop biting nails."
    		},
    		{
    			title: "Learning Habit",
    			type: "learning",
    			content: "Taking a new course, reading, learning a new skill, unlearn limiting beliefs."
    		},
    		{
    			title: "Social Habit",
    			type: "social",
    			content: "Calling friends or family, meeting new people, being more open, stop toxic patterns."
    		}
    	];

    	let userTemp = {
    		name: "",
    		email: "",
    		password: "",
    		habit: "",
    		habitType: true,
    		habitDateStartISOString: "",
    		habitDateStartUTCString: "",
    		habitDateEndISOString: "",
    		habitDateEndUTCString: "",
    		habitCategory: []
    	};

    	const handleSignUp = async () => {
    		const fetchURL = "https://sanderjson-pr-2021-days.builtwithdark.com/createNewUser";

    		const fetchOptions = {
    			method: "POST",
    			headers: { "content-type": "application/json" },
    			body: JSON.stringify({
    				name: userTemp.name,
    				email: userTemp.email.toLocaleLowerCase(),
    				password: userTemp.password,
    				habit: userTemp.habit,
    				habitType: userTemp.habitType,
    				habitCategory: userTemp.habitCategory,
    				habitDateStartUTCString: userTemp.habitDateStartUTCString,
    				habitDateEndUTCString: userTemp.habitDateEndUTCString
    			})
    		};

    		const postData = await fetch(fetchURL, fetchOptions).then(res => res.json()).then(res => {
    			if (res.Error) {
    				errMessage.set(res.Error);
    				push(`#/error`);
    			} else {
    				if ($isLocalStorage()) {
    					console.log("signup before LSuserAuth", $LSuserAuth);
    					console.log("signup before LSuserDetails", $LSuserDetails);
    					console.log("signup before LSisUserDefined", $LSisUserDefined);
    					LSuserAuth.set(res.userAuth);
    					LSuserDetails.set(res.userDetails);
    					LSisUserDefined.set(true);
    					console.log("signup after LSuserAuth", $LSuserAuth);
    					console.log("signup after LSuserDetails", $LSuserDetails);
    					console.log("signup after LSisUserDefined", $LSisUserDefined);
    				} else {
    					tempUserDetails.set(res.userDetails); // console.log("local storage is enabled");
    					tempIsUserDefined.set(true);
    				} // console.log("local storage is not available");
    			}
    		}).catch(err => {
    			errMessage.set(res.Error);
    			push(`#/error`);
    		});
    	};

    	const handleToggleHabitType = () => {
    		$$invalidate(0, userTemp.habitType = !userTemp.habitType, userTemp);
    	};

    	onMount(() => {
    		tempIsUserDefined.set(false);
    		LSisUserDefined.set(false);
    		let dateStart = new Date();
    		let dateEnd = new Date();
    		dateEnd.setDate(dateEnd.getDate() + 20);
    		$$invalidate(0, userTemp.habitDateStartUTCString = dateStart.toUTCString(), userTemp);
    		$$invalidate(0, userTemp.habitDateEndUTCString = dateEnd.toUTCString(), userTemp);
    	}); // console.log("user.habitDateStartUTCString", user.habitDateStartUTCString);
    	// console.log("user.habitDateEndUTCString", user.habitDateEndUTCString);

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<ScreenSignUp> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];

    	function input0_input_handler() {
    		userTemp.name = this.value;
    		$$invalidate(0, userTemp);
    	}

    	function input1_input_handler() {
    		userTemp.email = this.value;
    		$$invalidate(0, userTemp);
    	}

    	function input2_input_handler() {
    		userTemp.password = this.value;
    		$$invalidate(0, userTemp);
    	}

    	function input3_input_handler() {
    		userTemp.habit = this.value;
    		$$invalidate(0, userTemp);
    	}

    	function input_change_handler() {
    		userTemp.habitCategory = get_binding_group_value($$binding_groups[0], this.__value, this.checked);
    		$$invalidate(0, userTemp);
    	}

    	$$self.$capture_state = () => ({
    		ContentWrapper,
    		AppHeader,
    		TwentyTwentyOne: _2021,
    		push,
    		onMount,
    		tempIsUserDefined,
    		tempUserDetails,
    		isLocalStorage,
    		errMessage,
    		LSisUserDefined,
    		LSuserAuth,
    		LSuserDetails,
    		contentHabitsInfo,
    		userTemp,
    		handleSignUp,
    		handleToggleHabitType,
    		$isLocalStorage,
    		$LSuserAuth,
    		$LSuserDetails,
    		$LSisUserDefined
    	});

    	$$self.$inject_state = $$props => {
    		if ("userTemp" in $$props) $$invalidate(0, userTemp = $$props.userTemp);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		userTemp,
    		contentHabitsInfo,
    		handleSignUp,
    		handleToggleHabitType,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input_change_handler,
    		$$binding_groups
    	];
    }

    class ScreenSignUp extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScreenSignUp",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src/routes/ScreenAbout.svelte generated by Svelte v3.31.0 */
    const file$h = "src/routes/ScreenAbout.svelte";

    // (7:0) <AppHeader>
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
    		source: "(7:0) <AppHeader>",
    		ctx
    	});

    	return block;
    }

    // (11:0) <ContentWrapper>
    function create_default_slot$3(ctx) {
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
    			add_location(h1, file$h, 11, 2, 265);
    			attr_dev(a, "class", "underline");
    			attr_dev(a, "href", "/signup");
    			add_location(a, file$h, 19, 6, 555);
    			add_location(p0, file$h, 17, 4, 494);
    			attr_dev(p1, "class", "mt-2");
    			add_location(p1, file$h, 22, 4, 692);
    			attr_dev(p2, "class", "mt-2");
    			add_location(p2, file$h, 28, 4, 919);
    			add_location(li0, file$h, 33, 6, 1114);
    			add_location(li1, file$h, 34, 6, 1189);
    			add_location(li2, file$h, 35, 6, 1244);
    			attr_dev(ul, "class", "mt-2");
    			add_location(ul, file$h, 32, 4, 1090);
    			attr_dev(p3, "class", "mt-2");
    			add_location(p3, file$h, 37, 4, 1324);
    			attr_dev(div, "class", " space-y-6 mt-6 prose prose-indigo prose-lg text-gray-500 mx-auto");
    			add_location(div, file$h, 15, 2, 406);
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
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(11:0) <ContentWrapper>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
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
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScreenAbout",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* src/svg/error.svelte generated by Svelte v3.31.0 */

    const { Error: Error_1$1 } = globals;
    const file$i = "src/svg/error.svelte";

    function create_fragment$j(ctx) {
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
    			add_location(path0, file$i, 0, 143, 143);
    			attr_dev(path1, "d", "M542.94,0c1.51,0,2.27,1,2.27,2.84v158a3.3,3.3,0,0,1-.57,2.28l-19.89,19.9-17.63,17.62,37.52,37.52a3.3,3.3,0,0,1,.57,2.28V400.24l-.57.57-19.78,14.78v.57h-.57v.57H448.54a2.5,2.5,0,0,1-2.82-2.84V262.66H387.16V398.54a2.32,2.32,0,0,1-.28,1.42,1.13,1.13,0,0,0-.29.85l-19.9,14.78a3.22,3.22,0,0,1-2.27,1.14H289.94a2.5,2.5,0,0,1-2.84-2.84V16.49a3.26,3.26,0,0,1,1.14-2.28L301.88,2.27a1.14,1.14,0,0,1,.29-.85,1.19,1.19,0,0,0,.28-.85,2.44,2.44,0,0,0,1.14-.29A2.58,2.58,0,0,1,304.72,0H542.94ZM307.57,10.23V391.71l34.11-33.54V43.78Zm4-4.55L326.33,19.9l5.12,5.68L345.66,39.8H501.44L535.55,5.68Zm.57,390.58h11.37l26.72-26.72-5.69-5.68-15.35,15.35-4,4Zm18.76,0h11.94l17.05-17.05-5.68-5.69Zm23.31-340-4-4-2.85-2.84V193.3l33.55-33.54V83l-6.83-6.82-4-4L363.85,66l-4-4Zm26.72,309.28V241.62l-6.83-7.39-4-4-6.26-5.68-4-4-5.68-6.26-4-4-2.85-2.27V358.17l14.22,14.22,5.68,5.11,13.65,14.21V365.56Zm-30.13,30.7h11.93l7.4-6.82-6.26-6.25ZM357.6,44.91h-6.26l2.85,3.41Zm99.56,152.94h38.69l-34.14-34.11H385.48L371.26,178l-5.69,5.68-14.23,14.22Zm-99.56,5.68h-6.26l2.85,2.85ZM376.93,44.91H365l-6.82,6.83L364.42,58Zm0,158.62H365l-6.82,6.82,6.25,6.26Zm19.9-158.62H384.89L368.4,62l2.84,2.84,2.84,2.84ZM374.08,226.27l22.75-22.74H384.89L368.4,220l2.84,3.41Zm-3.41,170h6.26l-2.85-2.84ZM416.72,44.91H404.79L378.07,71.63l6.25,6.26Zm0,158.62H404.79l-26.72,26.72,6.25,5.69Zm28.43-98.92h-58v54h58Zm-8.53-59.7H424.68L390.57,79h11.94ZM390.57,237.64h11.94l34.11-34.11H424.68ZM456.52,44.91H444.58L410.47,79h11.94ZM444.58,203.53l-34.11,34.11h11.94l34.11-34.11ZM476.7,44.91H464.12L429.8,79h12.58ZM429.8,237.64h12.58l34.32-34.11H464.12ZM495.85,44.91h-12L449.7,79h12ZM449.7,237.64h12l34.18-34.11h-12Zm50-188.18L495.18,54l-9.1,9.1-.56,1.13-5.12,4.55L466.19,83v76.76l14.24,14.78,5.69,5.11,9.12,9.1,4.55,4.55ZM466.19,391.71l33.54-33.54V208.08l-12.51,12.51-1.14,1.14-.56.56L483.81,224l-.57.57-2.84,2.84-14.21,14.21Zm4.31,4.55h11.38l27.28-26.72-5.68-5.68L490.4,376.37l-2.84,2.84-.57.57-3.41,3.41-4,4Zm19.15,0h11.94l17.05-17.05-6.25-5.69Zm49.88-386L525.88,23.88l-1.13.57L520.2,29l-5.12,5.69-9.1,9.1V193.3l33.55-33.54Zm0,355.33V241.62L506,208.08V358.17l14.22,14.22,5.68,5.11,13.65,14.21V365.56Zm-30.14,30.7h11.94l6.83-6.82-5.69-6.25Zm19.9,0h6.26l-3.41-2.84Z");
    			add_location(path1, file$i, 0, 2855, 2855);
    			attr_dev(path2, "d", "M829.48,0c1.51,0,2.27,1,2.27,2.84v158a3.35,3.35,0,0,1-.57,2.28l-19.9,19.9-17.62,17.62,37.52,37.52a3.35,3.35,0,0,1,.57,2.28V400.24l-.57.57L811.4,415.59v.57h-.57v.57H735.08a2.5,2.5,0,0,1-2.82-2.84V262.66H673.7V398.54a2.23,2.23,0,0,1-.29,1.42,1.16,1.16,0,0,0-.28.85l-19.9,14.78a3.24,3.24,0,0,1-2.27,1.14H576.48a2.5,2.5,0,0,1-2.84-2.84V16.49a3.29,3.29,0,0,1,1.13-2.28L588.42,2.27a1.18,1.18,0,0,1,.28-.85A1.15,1.15,0,0,0,589,.57a2.47,2.47,0,0,0,1.14-.29A2.58,2.58,0,0,1,591.26,0H829.48ZM594.1,10.23V391.71l34.12-33.54V43.78Zm4-4.55L612.87,19.9,618,25.58,632.2,39.8H788L822.08,5.68Zm.57,390.58H610l26.72-26.72-5.68-5.68-15.35,15.35-4,4Zm18.76,0h11.94l17.06-17.05-5.69-5.69Zm23.31-340-4-4-2.84-2.84V193.3l33.54-33.54V83l-6.82-6.82-4-4L650.39,66l-4-4Zm26.72,309.28V241.62l-6.82-7.39-4-4-6.25-5.68-4-4-5.69-6.26-4-4-2.84-2.27V358.17l14.22,14.22,5.68,5.11,13.64,14.21V365.56Zm-30.13,30.7h11.94l7.39-6.82-6.25-6.25Zm6.82-351.35h-6.25l2.84,3.41ZM743.7,197.85h38.68l-34.13-34.11H672L657.8,178l-5.7,5.68-14.22,14.22Zm-99.57,5.68h-6.25l2.84,2.85ZM663.46,44.91H651.53l-6.83,6.83L651,58Zm0,158.62H651.53l-6.83,6.82,6.26,6.26Zm19.9-158.62H671.42L654.94,62l2.84,2.84,2.84,2.84ZM660.62,226.27l22.74-22.74H671.42L654.94,220l2.84,3.41Zm-3.41,170h6.25l-2.84-2.84Zm46-351.35H691.32L664.6,71.63l6.26,6.26Zm0,158.62H691.32L664.6,230.25l6.26,5.69Zm28.43-98.92h-58v54h58Zm-8.53-59.7H711.22L677.11,79h11.94Zm-46,192.73h11.94l34.11-34.11H711.22ZM743.06,44.91H731.12L697,79H709ZM731.12,203.53,697,237.64H709l34.11-34.11ZM763.23,44.91H750.65L716.34,79h12.58ZM716.34,237.64h12.58l34.31-34.11H750.65Zm66-192.73h-12L736.24,79h12ZM736.24,237.64h12l34.18-34.11h-12Zm50-188.18L781.72,54l-9.1,9.1-.57,1.13-5.11,4.55L752.72,83v76.76L767,174.54l5.7,5.11,9.11,9.1,4.56,4.55ZM752.72,391.71l33.55-33.54V208.08l-12.51,12.51-1.14,1.14-.57.56-1.7,1.71-.57.57-2.84,2.84-14.22,14.21Zm4.32,4.55h11.37l27.29-26.72L790,363.86l-13.08,12.51-2.84,2.84-.57.57-3.41,3.41-4,4Zm19.14,0h11.94l17.06-17.05-6.25-5.69Zm49.88-386L812.42,23.88l-1.14.57L806.73,29l-5.11,5.69-9.1,9.1V193.3l33.54-33.54Zm0,355.33V241.62l-33.54-33.54V358.17l14.21,14.22,5.69,5.11,13.64,14.21V365.56Zm-30.13,30.7h11.94l6.82-6.82L809,383.19Zm19.9,0h6.25l-3.41-2.84Z");
    			add_location(path2, file$i, 0, 5062, 5062);
    			attr_dev(path3, "d", "M1118.29,2.84V399.11a2.32,2.32,0,0,1-.57,1.7l-15.35,15.35h-.57v.57H861.88l-.57-.57h-.57v-.57l-.57-.57v-398a.5.5,0,0,1,.57-.57v-.57L876.09.57h.57A1.66,1.66,0,0,1,877.8,0h239.35V.57h.57a.5.5,0,0,0,.57.57v1.7ZM880.64,9.1V392.28l8.53-8.52,21.6-21,4-4.55v-315Zm4-3.42,9.67,9.67L900,20.47,918.73,39.8h156.35l18.76-19.33,4.55-4.55,1.13-.57,9.67-9.67Zm0,390.58h11.94l34.11-34.11H918.73l-4,4L892,388.3Zm19.9,0h11.94l34.11-34.11H938.63ZM920.44,63.11V352.49L929,344l10.8-10.8.57-.57,9.66-9.67,4.55-4.54V83l-7.39-6.82-3.41-4L937.49,66l-4-4-5.68-5.69-4-4-3.41-3.41V63.11Zm10.23-18.2h-6.25l3.41,3.41Zm93.24,277.44H958.53l-3.41,3.42-9.1,9.09-1.7,1.71-.57.57-12.51,12.5-6.82,6.83h145l-2.84-2.85-18.76-18.76-12.51-12.51Zm-99.49,73.91h11.94l34.11-34.11H958.53ZM950.57,44.91H938.63l-7.39,7.39,2.84,2.28L937.49,58Zm19.9,0H958.53L941.47,62l5.69,6.25ZM944.32,396.26h11.93l34.12-34.11H978.43Zm46-351.35H978.43L951.14,72.2l6.25,5.69Zm28.42,55.15H960.23V316.67h58.56Zm-8.52-55.15H997.76L963.65,79.59h12.5ZM963.65,396.26h12.5l34.12-34.11H997.76Zm65.94-351.35h-11.93L983.54,79.59h11.94Zm-46,351.35h11.94l34.11-34.11h-11.93Zm66-351.35h-11.94l-34.11,34.68h11.94Zm-46,351.35h11.94l34.11-34.11h-11.94Zm66-351.35h-11.94l-34.11,34.68h11.94l19.33-19.07,5.12-5.78Zm-46.05,351.35h11.94l34.11-34.11h-11.94Zm50-347.37L1068.82,54l-5.11,4.55L1058,64.24l-9.1,9.1L1039.26,83V318.38L1058,337.71l5.69,5.11,9.66,9.67Zm-30.13,347.37h11.94L1081.9,369l-5.69-5.68ZM1087,374.09l-1.14-1.14-22.74,23.31h11.94l17.05-17.05Zm26.15,4V9.1l-5.12,5.11-4.55,4.55-1.13,1.14-4.55,4.55-9.67,9.66-9.09,9.1v315l18.76,18.76,5.68,5.69,9.67,9.66V378.07Zm-11.37,10.8-5.69-5.68L1083,396.26H1095Zm.57,7.39h6.82l-3.41-3.41Z");
    			add_location(path3, file$i, 0, 7251, 7251);
    			attr_dev(path4, "d", "M1402.55,0c1.51,0,2.27,1,2.27,2.84v158a3.3,3.3,0,0,1-.57,2.28l-19.89,19.9-17.63,17.62,37.52,37.52a3.3,3.3,0,0,1,.57,2.28V400.24l-.57.57-19.78,14.78v.57h-.57v.57h-75.74a2.5,2.5,0,0,1-2.83-2.84V262.66h-58.56V398.54a2.32,2.32,0,0,1-.28,1.42,1.13,1.13,0,0,0-.29.85l-19.9,14.78a3.22,3.22,0,0,1-2.27,1.14h-74.48a2.5,2.5,0,0,1-2.84-2.84V16.49a3.26,3.26,0,0,1,1.14-2.28l13.64-11.94a1.14,1.14,0,0,1,.29-.85,1.19,1.19,0,0,0,.28-.85,2.44,2.44,0,0,0,1.14-.29,2.58,2.58,0,0,1,1.13-.28h238.22ZM1167.18,10.23V391.71l34.11-33.54V43.78Zm4-4.55,14.78,14.22,5.12,5.68,14.21,14.22h155.78l34.11-34.12Zm.57,390.58h11.37l26.72-26.72-5.69-5.68-15.35,15.35-4,4Zm18.76,0h11.94l17-17.05-5.68-5.69Zm23.31-340-4-4L1207,49.46V193.3l33.55-33.54V83l-6.82-6.82-4-4L1223.46,66l-4-4Zm26.72,309.28V241.62l-6.82-7.39-4-4-6.26-5.68-4-4-5.68-6.26-4-4-2.85-2.27V358.17l14.22,14.22,5.68,5.11,13.65,14.21V365.56Zm-30.13,30.7h11.94l7.39-6.82-6.26-6.25Zm6.82-351.35H1211l2.85,3.41Zm99.56,152.94h38.69l-34.14-34.11h-76.23L1230.87,178l-5.69,5.68L1211,197.85Zm-99.56,5.68H1211l2.85,2.85Zm19.33-158.62H1224.6l-6.82,6.83L1224,58Zm0,158.62H1224.6l-6.82,6.82,6.25,6.26Zm19.9-158.62H1244.5L1228,62l2.84,2.84,2.85,2.84ZM1233.7,226.27l22.74-22.74H1244.5L1228,220l2.84,3.41Zm-3.42,170h6.26l-2.84-2.84Zm46-351.35H1264.4l-26.72,26.72,6.25,6.26Zm0,158.62H1264.4l-26.72,26.72,6.25,5.69Zm28.43-98.92h-58v54h58Zm-8.53-59.7h-11.94L1250.18,79h11.94Zm-46,192.73h11.94l34.11-34.11h-11.94Zm66-192.73h-11.94L1270.08,79H1282Zm-11.94,158.62-34.11,34.11H1282l34.11-34.11Zm32.12-158.62h-12.58L1289.41,79H1302Zm-46.9,192.73H1302l34.32-34.11h-12.58Zm66-192.73h-12L1309.31,79h12Zm-46.15,192.73h12l34.18-34.11h-12Zm50-188.18L1354.79,54l-9.09,9.1-.57,1.13L1340,68.79,1325.8,83v76.76L1340,174.54l5.69,5.11,9.12,9.1,4.55,4.55ZM1325.8,391.71l33.54-33.54V208.08l-12.51,12.51-1.13,1.14-.57.56-1.71,1.71-.57.57-2.84,2.84-14.21,14.21Zm4.31,4.55h11.38l27.28-26.72-5.68-5.68L1350,376.37l-2.84,2.84-.57.57-3.41,3.41-4,4Zm19.15,0h11.94l17-17.05-6.25-5.69Zm49.88-386-13.65,13.65-1.13.57L1379.81,29l-5.12,5.69-9.1,9.1V193.3l33.55-33.54Zm0,355.33V241.62l-33.55-33.54V358.17l14.22,14.22,5.68,5.11,13.65,14.21V365.56ZM1369,396.26h11.94l6.83-6.82-5.69-6.25Zm19.9,0h6.26l-3.41-2.84Z");
    			add_location(path4, file$i, 0, 8914, 8914);
    			attr_dev(g0, "id", "Layer_1-2");
    			attr_dev(g0, "data-name", "Layer 1");
    			add_location(g0, file$i, 0, 105, 105);
    			attr_dev(g1, "id", "Layer_2");
    			attr_dev(g1, "data-name", "Layer 2");
    			add_location(g1, file$i, 0, 69, 69);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 1404.82 416.73");
    			add_location(svg, file$i, 0, 0, 0);
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
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props) {
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
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Error",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src/routes/ScreenError.svelte generated by Svelte v3.31.0 */

    const { Error: Error_1$2 } = globals;
    const file$j = "src/routes/ScreenError.svelte";

    // (8:0) <AppHeader>
    function create_default_slot_1$4(ctx) {
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
    		id: create_default_slot_1$4.name,
    		type: "slot",
    		source: "(8:0) <AppHeader>",
    		ctx
    	});

    	return block;
    }

    // (12:0) <ContentWrapper>
    function create_default_slot$4(ctx) {
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
    			add_location(div, file$j, 12, 2, 291);
    			attr_dev(a, "href", "/#/start");
    			add_location(a, file$j, 13, 2, 325);
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
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(12:0) <ContentWrapper>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let appheader;
    	let t;
    	let contentwrapper;
    	let current;

    	appheader = new AppHeader({
    			props: {
    				$$slots: { default: [create_default_slot_1$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	contentwrapper = new ContentWrapper({
    			props: {
    				$$slots: { default: [create_default_slot$4] },
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
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScreenError",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }

    var routes = {
    	"/": ScreenUser,
    	"/start": ScreenStart,
    	"/signup": ScreenSignUp,
    	"/about": ScreenAbout,
    	"/error": ScreenError,
    	// "/user/:id": ScreenUser,

    	// Using named parameters, with last being optional
    	// "/author/:first/:last?": Author,
    	// Wildcard parameter
    	// "/book/*": Book,
    	// Catch-all
    	// This is optional, but if present it must be the last
    	// "*": NotFound,
    };

    /* src/App.svelte generated by Svelte v3.31.0 */
    const file$k = "src/App.svelte";

    function create_fragment$l(ctx) {
    	let div1;
    	let div0;
    	let router;
    	let current;
    	router = new Router({ props: { routes }, $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(router.$$.fragment);
    			attr_dev(div0, "class", "flex flex-col justify-center py-12 sm:px-6 lg:px-8");
    			add_location(div0, file$k, 41, 2, 1071);
    			attr_dev(div1, "class", "bg bg-repeat h-screen w-screen overflow-x-hidden relative");
    			set_style(div1, "background-image", "url(/static/subtle-bg/greek-vase.png)");
    			add_location(div1, file$k, 38, 0, 929);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(router, div0, null);
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
    			if (detaching) detach_dev(div1);
    			destroy_component(router);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let $LSisUserDefined;
    	let $LSuserDetails;
    	let $tempIsUserDefined;
    	let $tempUserDetails;
    	validate_store(LSisUserDefined, "LSisUserDefined");
    	component_subscribe($$self, LSisUserDefined, $$value => $$invalidate(0, $LSisUserDefined = $$value));
    	validate_store(LSuserDetails, "LSuserDetails");
    	component_subscribe($$self, LSuserDetails, $$value => $$invalidate(2, $LSuserDetails = $$value));
    	validate_store(tempIsUserDefined, "tempIsUserDefined");
    	component_subscribe($$self, tempIsUserDefined, $$value => $$invalidate(1, $tempIsUserDefined = $$value));
    	validate_store(tempUserDetails, "tempUserDetails");
    	component_subscribe($$self, tempUserDetails, $$value => $$invalidate(3, $tempUserDetails = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	const setActiveUser = () => {
    		if ($LSisUserDefined) {
    			activeUserDetails.set($LSuserDetails);
    			replace("/");
    		} else if ($tempIsUserDefined) {
    			activeUserDetails.set($tempUserDetails); // console.log("local storage user active");
    			replace("/");
    		} else {
    			// console.log("no user defined directing to /#start");
    			replace("/start"); // console.log("temporary user active");
    		}
    	};

    	onMount(() => {
    		setActiveUser();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Router,
    		routes,
    		replace,
    		tempIsUserDefined,
    		tempUserDetails,
    		activeUserDetails,
    		LSuserDetails,
    		LSisUserDefined,
    		onMount,
    		setActiveUser,
    		$LSisUserDefined,
    		$LSuserDetails,
    		$tempIsUserDefined,
    		$tempUserDetails
    	});

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$LSisUserDefined, $tempIsUserDefined*/ 3) {
    			 $LSisUserDefined == true || $tempIsUserDefined == true
    			? setActiveUser()
    			: "";
    		}
    	};

    	return [$LSisUserDefined, $tempIsUserDefined];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$l.name
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
