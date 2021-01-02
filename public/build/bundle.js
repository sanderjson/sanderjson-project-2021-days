
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

    /* src/Doodle.svelte generated by Svelte v3.31.0 */

    const file = "src/Doodle.svelte";

    function create_fragment$1(ctx) {
    	let css_doodle;

    	const block = {
    		c: function create() {
    			css_doodle = element("css-doodle");

    			css_doodle.textContent = `${`
    :doodle {
    @grid: 18 / 100vmax;
    background: #0a0c27;
  }
  --hue: calc(180 + 1.5 * @row * @col);
  background: hsl(var(--hue), 50%, 70%);
  margin: -.5px;
  transition: @r(.5s) ease;
  clip-path: polygon(@pick(
    '0 0, 100% 0, 100% 100%',
    '0 0, 100% 0, 0 100%',
    '0 0, 100% 100%, 0 100%',
    '100% 0, 100% 100%, 0 100%'
  ));
  `}`;

    			add_location(css_doodle, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, css_doodle, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(css_doodle);
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

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Doodle", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Doodle> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Doodle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Doodle",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    const errMessage = writable(null);

    const tempUserDetailsData = {
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
    const tempIsUserDefined = writable(false);
    const isLocalStorage = readable(fnIsLocalStorage);

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

    /* src/routes/ScreenUser.svelte generated by Svelte v3.31.0 */
    const file$1 = "src/routes/ScreenUser.svelte";

    function create_fragment$2(ctx) {
    	let div0;
    	let doodle;
    	let t0;
    	let div5;
    	let div4;
    	let section;
    	let div1;
    	let t2;
    	let div2;
    	let t3;
    	let t4;
    	let div3;
    	let t5;
    	let t6;
    	let t7;
    	let h1;
    	let t8;
    	let t9_value = /*activeUserDetails*/ ctx[1].name + "";
    	let t9;
    	let t10;
    	let t11;
    	let p0;
    	let t12;

    	let t13_value = (/*activeUserDetails*/ ctx[1].habitType
    	? "start"
    	: "kick") + "";

    	let t13;
    	let t14;
    	let t15_value = /*activeUserDetails*/ ctx[1].habit + "";
    	let t15;
    	let t16;
    	let t17;
    	let p1;
    	let a;
    	let t19;

    	let t20_value = (/*activeUserDetails*/ ctx[1].habitType
    	? "start"
    	: "kick") + "";

    	let t20;
    	let t21;
    	let t22_value = /*activeUserDetails*/ ctx[1].habitDateEndUTCString + "";
    	let t22;
    	let t23;
    	let t24;
    	let script;
    	let script_src_value;
    	let current;
    	doodle = new Doodle({ $$inline: true });

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(doodle.$$.fragment);
    			t0 = space();
    			div5 = element("div");
    			div4 = element("div");
    			section = element("section");
    			div1 = element("div");
    			div1.textContent = "day";
    			t2 = space();
    			div2 = element("div");
    			t3 = text(/*daysIn*/ ctx[0]);
    			t4 = space();
    			div3 = element("div");
    			t5 = text(/*updateTime*/ ctx[2]);
    			t6 = text(" seconds");
    			t7 = space();
    			h1 = element("h1");
    			t8 = text("Hey ");
    			t9 = text(t9_value);
    			t10 = text("!");
    			t11 = space();
    			p0 = element("p");
    			t12 = text("You have challenged yourself to ");
    			t13 = text(t13_value);
    			t14 = text("\n        the habit of ");
    			t15 = text(t15_value);
    			t16 = text(".");
    			t17 = space();
    			p1 = element("p");
    			a = element("a");
    			a.textContent = "Research";
    			t19 = text("\n        suggests it takes 21 days to ");
    			t20 = text(t20_value);
    			t21 = text("\n        any habit. By ");
    			t22 = text(t22_value);
    			t23 = text(" you will have\n        achieved your goal.");
    			t24 = space();
    			script = element("script");
    			attr_dev(div0, "class", "h-screen w-screen overflow-hidden");
    			add_location(div0, file$1, 72, 0, 1890);
    			attr_dev(div1, "class", "text-2xl sm:text-5xl text-gray-500 text-center uppercase\n        leading-none");
    			add_location(div1, file$1, 81, 6, 2197);
    			attr_dev(div2, "class", "text-9xl sm:text-12xl font-bold text-center leading-none m-0 p-0");
    			add_location(div2, file$1, 86, 6, 2328);
    			attr_dev(div3, "class", "text-center text-gray-400");
    			add_location(div3, file$1, 90, 6, 2451);
    			attr_dev(h1, "class", "text-base sm:text-3xl font-bold pt-3");
    			add_location(h1, file$1, 91, 6, 2523);
    			attr_dev(p0, "class", "text-sm sm:text-2xl text-gray-500 pt-1 sm:pt-2");
    			add_location(p0, file$1, 94, 6, 2629);
    			attr_dev(a, "href", "https://yourknow.com/uploads/books/How_Long_Does_it_Take_to_Form_a_Habit__Backed_by_Science_.pdf");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$1, 99, 8, 2909);
    			attr_dev(p1, "class", "text-sm sm:text-2xl text-gray-500 pt-1 sm:pt-2");
    			add_location(p1, file$1, 98, 6, 2842);
    			attr_dev(section, "class", "py-8 px-4 sm:py-10 sm:px-8");
    			add_location(section, file$1, 80, 4, 2146);
    			attr_dev(div4, "class", "container my-8 mx-16 bg-white rounded-lg shadow-xl max-w-screen-sm\n    transition-all duration-150");
    			add_location(div4, file$1, 77, 2, 2025);
    			attr_dev(div5, "class", "absolute inset-0 flex justify-center items-center");
    			add_location(div5, file$1, 76, 0, 1959);
    			script.defer = true;
    			if (script.src !== (script_src_value = "https://unpkg.com/css-doodle@0.8.5/css-doodle.min.js")) attr_dev(script, "src", script_src_value);
    			add_location(script, file$1, 113, 2, 3336);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(doodle, div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, section);
    			append_dev(section, div1);
    			append_dev(section, t2);
    			append_dev(section, div2);
    			append_dev(div2, t3);
    			append_dev(section, t4);
    			append_dev(section, div3);
    			append_dev(div3, t5);
    			append_dev(div3, t6);
    			append_dev(section, t7);
    			append_dev(section, h1);
    			append_dev(h1, t8);
    			append_dev(h1, t9);
    			append_dev(h1, t10);
    			append_dev(section, t11);
    			append_dev(section, p0);
    			append_dev(p0, t12);
    			append_dev(p0, t13);
    			append_dev(p0, t14);
    			append_dev(p0, t15);
    			append_dev(p0, t16);
    			append_dev(section, t17);
    			append_dev(section, p1);
    			append_dev(p1, a);
    			append_dev(p1, t19);
    			append_dev(p1, t20);
    			append_dev(p1, t21);
    			append_dev(p1, t22);
    			append_dev(p1, t23);
    			insert_dev(target, t24, anchor);
    			append_dev(document.head, script);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*daysIn*/ 1) set_data_dev(t3, /*daysIn*/ ctx[0]);
    			if (!current || dirty & /*updateTime*/ 4) set_data_dev(t5, /*updateTime*/ ctx[2]);
    			if ((!current || dirty & /*activeUserDetails*/ 2) && t9_value !== (t9_value = /*activeUserDetails*/ ctx[1].name + "")) set_data_dev(t9, t9_value);

    			if ((!current || dirty & /*activeUserDetails*/ 2) && t13_value !== (t13_value = (/*activeUserDetails*/ ctx[1].habitType
    			? "start"
    			: "kick") + "")) set_data_dev(t13, t13_value);

    			if ((!current || dirty & /*activeUserDetails*/ 2) && t15_value !== (t15_value = /*activeUserDetails*/ ctx[1].habit + "")) set_data_dev(t15, t15_value);

    			if ((!current || dirty & /*activeUserDetails*/ 2) && t20_value !== (t20_value = (/*activeUserDetails*/ ctx[1].habitType
    			? "start"
    			: "kick") + "")) set_data_dev(t20, t20_value);

    			if ((!current || dirty & /*activeUserDetails*/ 2) && t22_value !== (t22_value = /*activeUserDetails*/ ctx[1].habitDateEndUTCString + "")) set_data_dev(t22, t22_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(doodle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(doodle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(doodle);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t24);
    			detach_dev(script);
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
    	let $LSisUserDefined;
    	let $LSuserDetails;
    	let $tempIsUserDefined;
    	let $tempUserDetails;
    	validate_store(LSisUserDefined, "LSisUserDefined");
    	component_subscribe($$self, LSisUserDefined, $$value => $$invalidate(8, $LSisUserDefined = $$value));
    	validate_store(LSuserDetails, "LSuserDetails");
    	component_subscribe($$self, LSuserDetails, $$value => $$invalidate(9, $LSuserDetails = $$value));
    	validate_store(tempIsUserDefined, "tempIsUserDefined");
    	component_subscribe($$self, tempIsUserDefined, $$value => $$invalidate(10, $tempIsUserDefined = $$value));
    	validate_store(tempUserDetails, "tempUserDetails");
    	component_subscribe($$self, tempUserDetails, $$value => $$invalidate(11, $tempUserDetails = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ScreenUser", slots, []);
    	let { params } = $$props;
    	let dateStart;
    	let diff;
    	let daysIn;
    	let dateEnd;
    	let dateCurrent;

    	let activeUserDetails = {
    		name: "",
    		habit: "",
    		habitType: null,
    		habitCategory: [],
    		habitDateStartUTCString: "",
    		habitDateEndUTCString: ""
    	};

    	onMount(() => {
    		if ($LSisUserDefined) {
    			$$invalidate(1, activeUserDetails = $LSuserDetails);
    		} else if ($tempIsUserDefined) {
    			$$invalidate(1, activeUserDetails = $tempUserDetails); // console.log("local storage user active");
    		} else {
    			// console.log("no user defined directing to /#start");
    			push("/start"); // console.log("temporary user active");
    		}

    		$$invalidate(4, dateEnd = new Date(activeUserDetails.habitDateEndUTCString).getTime());
    		dateCurrent = new Date().getTime();

    		const calDaysIn = (dateStart, dateToday) => {
    			let diff = dateToday - dateStart;
    			return (diff / 1000 / 3600 / 24).toFixed(0) + 1;
    		};

    		const getDates = () => {
    			dateStart = new Date(activeUserDetails.habitDateStartUTCString).getTime();
    			$$invalidate(0, daysIn = calDaysIn(dateStart, dateCurrent));
    		};

    		getDates();
    	});

    	let counter = new Date().getTime();

    	const update = setInterval(
    		() => {
    			$$invalidate(5, counter++, counter);
    		},
    		1000
    	);

    	let updateTime = dateEnd - counter;
    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ScreenUser> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("params" in $$props) $$invalidate(3, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		Doodle,
    		push,
    		pop,
    		replace,
    		onMount,
    		tempIsUserDefined,
    		tempUserDetails,
    		LSisUserDefined,
    		LSuserAuth,
    		LSuserDetails,
    		params,
    		dateStart,
    		diff,
    		daysIn,
    		dateEnd,
    		dateCurrent,
    		activeUserDetails,
    		counter,
    		update,
    		updateTime,
    		$LSisUserDefined,
    		$LSuserDetails,
    		$tempIsUserDefined,
    		$tempUserDetails
    	});

    	$$self.$inject_state = $$props => {
    		if ("params" in $$props) $$invalidate(3, params = $$props.params);
    		if ("dateStart" in $$props) dateStart = $$props.dateStart;
    		if ("diff" in $$props) diff = $$props.diff;
    		if ("daysIn" in $$props) $$invalidate(0, daysIn = $$props.daysIn);
    		if ("dateEnd" in $$props) $$invalidate(4, dateEnd = $$props.dateEnd);
    		if ("dateCurrent" in $$props) dateCurrent = $$props.dateCurrent;
    		if ("activeUserDetails" in $$props) $$invalidate(1, activeUserDetails = $$props.activeUserDetails);
    		if ("counter" in $$props) $$invalidate(5, counter = $$props.counter);
    		if ("updateTime" in $$props) $$invalidate(2, updateTime = $$props.updateTime);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*dateEnd, counter*/ 48) {
    			 $$invalidate(2, updateTime = dateEnd - counter);
    		}
    	};

    	return [daysIn, activeUserDetails, updateTime, params, dateEnd, counter];
    }

    class ScreenUser extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { params: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScreenUser",
    			options,
    			id: create_fragment$2.name
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

    /* src/components/ButtonPassword.svelte generated by Svelte v3.31.0 */

    const file$2 = "src/components/ButtonPassword.svelte";

    function create_fragment$3(ctx) {
    	let button;
    	let t;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(/*value*/ ctx[0]);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "w-full inline-flex items-center align-middle justify-center p-1.5\n  border border-transparent rounded-md shadow-sm text-white bg-indigo-100\n  hover:bg-indigo-700 outline-none focus:outline-none focus:ring-2\n  focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150");
    			add_location(button, file$2, 4, 0, 40);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*value*/ 1) set_data_dev(t, /*value*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
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

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ButtonPassword", slots, []);
    	let { value } = $$props;
    	const writable_props = ["value"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ButtonPassword> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({ value });

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value];
    }

    class ButtonPassword extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { value: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ButtonPassword",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !("value" in props)) {
    			console.warn("<ButtonPassword> was created without expected prop 'value'");
    		}
    	}

    	get value() {
    		throw new Error("<ButtonPassword>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ButtonPassword>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ContentWrapper.svelte generated by Svelte v3.31.0 */

    const file$3 = "src/components/ContentWrapper.svelte";

    function create_fragment$4(ctx) {
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
    			attr_dev(div0, "class", "bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10");
    			add_location(div0, file$3, 1, 2, 54);
    			attr_dev(div1, "class", "mt-8 sm:mx-auto sm:w-full sm:max-w-md");
    			add_location(div1, file$3, 0, 0, 0);
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContentWrapper",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/routes/ScreenStart.svelte generated by Svelte v3.31.0 */
    const file$4 = "src/routes/ScreenStart.svelte";

    // (82:2) <ContentWrapper>
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
    			add_location(label0, file$4, 84, 8, 2364);
    			attr_dev(input0, "id", "email");
    			attr_dev(input0, "name", "email");
    			attr_dev(input0, "type", "email");
    			attr_dev(input0, "autocomplete", "email");
    			input0.required = true;
    			attr_dev(input0, "class", "appearance-none block w-full px-3 py-2 border border-gray-300\n            rounded-md shadow-sm placeholder-gray-400 focus:outline-none\n            focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm");
    			add_location(input0, file$4, 88, 10, 2510);
    			attr_dev(div0, "class", "mt-1");
    			add_location(div0, file$4, 87, 8, 2481);
    			add_location(div1, file$4, 83, 6, 2350);
    			attr_dev(label1, "for", "password");
    			attr_dev(label1, "class", "block text-sm font-medium text-gray-700");
    			add_location(label1, file$4, 102, 8, 2960);
    			attr_dev(input1, "id", "password");
    			attr_dev(input1, "name", "password");
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "autocomplete", "password");
    			input1.required = true;
    			attr_dev(input1, "class", "appearance-none block w-full px-3 py-2 border border-gray-300\n            rounded-md shadow-sm placeholder-gray-400 focus:outline-none\n            focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm");
    			add_location(input1, file$4, 106, 10, 3104);
    			attr_dev(div2, "class", "mt-1");
    			add_location(div2, file$4, 105, 8, 3075);
    			add_location(div3, file$4, 101, 6, 2946);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "w-full flex justify-center py-2 px-4 border border-transparent\n          rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600\n          hover:bg-indigo-700 focus:outline-none focus:ring-2\n          focus:ring-offset-2 focus:ring-indigo-500");
    			add_location(button, file$4, 120, 8, 3569);
    			add_location(div4, file$4, 119, 6, 3555);
    			attr_dev(form, "class", "space-y-6");
    			add_location(form, file$4, 82, 4, 2279);
    			attr_dev(div5, "class", "w-full border-t border-gray-300");
    			add_location(div5, file$4, 134, 10, 4054);
    			attr_dev(div6, "class", "absolute inset-0 flex items-center");
    			add_location(div6, file$4, 133, 8, 3995);
    			attr_dev(span0, "class", "px-2 bg-white text-gray-500");
    			add_location(span0, file$4, 137, 10, 4186);
    			attr_dev(div7, "class", "relative flex justify-center text-sm");
    			add_location(div7, file$4, 136, 8, 4125);
    			attr_dev(div8, "class", "relative");
    			add_location(div8, file$4, 132, 6, 3964);
    			attr_dev(span1, "class", "");
    			add_location(span1, file$4, 148, 12, 4575);
    			attr_dev(a0, "href", "#/signup");
    			attr_dev(a0, "class", "w-full inline-flex justify-center py-2 px-4 border\n            border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium\n            text-gray-500 hover:bg-gray-50");
    			add_location(a0, file$4, 143, 10, 4339);
    			add_location(div9, file$4, 142, 8, 4323);
    			attr_dev(span2, "class", "");
    			add_location(span2, file$4, 158, 12, 4895);
    			attr_dev(a1, "href", "#/about");
    			attr_dev(a1, "class", "w-full inline-flex justify-center py-2 px-4 border\n            border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium\n            text-gray-500 hover:bg-gray-50");
    			add_location(a1, file$4, 153, 10, 4660);
    			add_location(div10, file$4, 152, 8, 4644);
    			attr_dev(div11, "class", "mt-6 grid grid-cols-2 gap-3");
    			add_location(div11, file$4, 141, 6, 4273);
    			attr_dev(div12, "class", "mt-6");
    			add_location(div12, file$4, 131, 4, 3939);
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
    		source: "(82:2) <ContentWrapper>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div2;
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let h2;
    	let t2;
    	let div0;
    	let p;
    	let t4;
    	let contentwrapper;
    	let current;

    	contentwrapper = new ContentWrapper({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			h2 = element("h2");
    			h2.textContent = "2021 Day Challenge";
    			t2 = space();
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "The year your someday became a reality";
    			t4 = space();
    			create_component(contentwrapper.$$.fragment);
    			attr_dev(img, "class", "mx-auto h-12 w-auto");
    			if (img.src !== (img_src_value = "https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Workflow");
    			add_location(img, file$4, 67, 4, 1802);
    			attr_dev(h2, "class", "mt-6 text-center text-3xl font-extrabold text-gray-900");
    			add_location(h2, file$4, 71, 4, 1943);
    			attr_dev(p, "class", "font-medium text-indigo-600 hover:text-indigo-500");
    			add_location(p, file$4, 75, 6, 2115);
    			attr_dev(div0, "class", "mt-2 text-center text-sm text-gray-600 max-w");
    			add_location(div0, file$4, 74, 4, 2050);
    			attr_dev(div1, "class", "sm:mx-auto sm:w-full sm:max-w-md");
    			add_location(div1, file$4, 66, 2, 1751);
    			attr_dev(div2, "class", "min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6\n  lg:px-8");
    			add_location(div2, file$4, 63, 0, 1656);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, h2);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, p);
    			append_dev(div2, t4);
    			mount_component(contentwrapper, div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const contentwrapper_changes = {};

    			if (dirty & /*$$scope, userTemp*/ 33) {
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
    			if (detaching) detach_dev(div2);
    			destroy_component(contentwrapper);
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
    	let $isLocalStorage;
    	validate_store(isLocalStorage, "isLocalStorage");
    	component_subscribe($$self, isLocalStorage, $$value => $$invalidate(4, $isLocalStorage = $$value));
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
    				replace(`#/error`);
    			} else {
    				if ($isLocalStorage()) {
    					LSuserAuth.set(res.userAuth);
    					LSuserDetails.set(res.userDetails);
    					LSisUserDefined.set(true);

    					// console.log("local storage is enabled");
    					replace("/");
    				} else {
    					tempUserDetails.set(res.userDetails);
    					tempIsUserDefined.set(true);

    					// console.log("local storage is not available");
    					replace("/");
    				}
    			}
    		}).catch(err => {
    			errMessage.set(res.Error);
    			replace(`#/error`);
    		});
    	};

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
    		ButtonPassword,
    		ContentWrapper,
    		push,
    		pop,
    		replace,
    		tempIsUserDefined,
    		tempUserDetails,
    		isLocalStorage,
    		errMessage,
    		LSisUserDefined,
    		LSuserAuth,
    		LSuserDetails,
    		userTemp,
    		handleSignIn,
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
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScreenStart",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/routes/ScreenSignUp.svelte generated by Svelte v3.31.0 */

    const { console: console_1$1 } = globals;
    const file$5 = "src/routes/ScreenSignUp.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (213:51) {:else}
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
    		source: "(213:51) {:else}",
    		ctx
    	});

    	return block;
    }

    // (213:10) {#if userTemp.habitType}
    function create_if_block$1(ctx) {
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
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(213:10) {#if userTemp.habitType}",
    		ctx
    	});

    	return block;
    }

    // (228:10) {#each contentHabitsInfo as habit}
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
    	let t1_value = /*habit*/ ctx[11].title + "";
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*habit*/ ctx[11].content + "";
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
    			input.__value = input_value_value = /*habit*/ ctx[11].type;
    			input.value = input.__value;
    			attr_dev(input, "id", input_id_value = /*habit*/ ctx[11].type);
    			attr_dev(input, "name", input_name_value = /*habit*/ ctx[11].type);
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "class", "focus:ring-indigo-500 h-4 w-4 text-indigo-600\n                  border-gray-300 rounded");
    			/*$$binding_groups*/ ctx[9][0].push(input);
    			add_location(input, file$5, 230, 16, 7180);
    			attr_dev(div0, "class", "flex items-center h-5");
    			add_location(div0, file$5, 229, 14, 7128);
    			attr_dev(label, "for", "comments");
    			attr_dev(label, "class", "font-medium text-gray-700");
    			add_location(label, file$5, 240, 16, 7577);
    			attr_dev(p, "class", "text-gray-500");
    			add_location(p, file$5, 243, 16, 7707);
    			attr_dev(div1, "class", "ml-3 text-sm");
    			add_location(div1, file$5, 239, 14, 7534);
    			attr_dev(div2, "class", "relative flex items-start");
    			add_location(div2, file$5, 228, 12, 7074);
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
    		source: "(228:10) {#each contentHabitsInfo as habit}",
    		ctx
    	});

    	return block;
    }

    // (115:0) <ContentWrapper>
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
    		if (/*userTemp*/ ctx[0].habitType) return create_if_block$1;
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
    			add_location(label0, file$5, 118, 6, 3261);
    			attr_dev(input0, "id", "name");
    			attr_dev(input0, "name", "name");
    			attr_dev(input0, "type", "name");
    			attr_dev(input0, "autocomplete", "name");
    			input0.required = true;
    			attr_dev(input0, "class", "appearance-none block w-full px-3 py-2 border border-gray-300\n          rounded-md shadow-sm placeholder-gray-400 focus:outline-none\n          focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm");
    			add_location(input0, file$5, 122, 8, 3390);
    			attr_dev(div0, "class", "mt-1");
    			add_location(div0, file$5, 121, 6, 3363);
    			add_location(div1, file$5, 117, 4, 3249);
    			attr_dev(label1, "for", "email");
    			attr_dev(label1, "class", "block text-sm font-medium text-gray-700");
    			add_location(label1, file$5, 136, 6, 3809);
    			attr_dev(input1, "id", "email");
    			attr_dev(input1, "name", "email");
    			attr_dev(input1, "type", "email");
    			attr_dev(input1, "autocomplete", "email");
    			input1.required = true;
    			attr_dev(input1, "class", "appearance-none block w-full px-3 py-2 border border-gray-300\n          rounded-md shadow-sm placeholder-gray-400 focus:outline-none\n          focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm");
    			add_location(input1, file$5, 140, 8, 3947);
    			attr_dev(div2, "class", "mt-1");
    			add_location(div2, file$5, 139, 6, 3920);
    			add_location(div3, file$5, 135, 4, 3797);
    			attr_dev(label2, "for", "password");
    			attr_dev(label2, "class", "block text-sm font-medium text-gray-700");
    			add_location(label2, file$5, 154, 6, 4371);
    			attr_dev(input2, "id", "password");
    			attr_dev(input2, "name", "password");
    			attr_dev(input2, "type", "password");
    			attr_dev(input2, "autocomplete", "password");
    			input2.required = true;
    			attr_dev(input2, "class", "appearance-none block w-full px-3 py-2 border border-gray-300\n          rounded-md shadow-sm placeholder-gray-400 focus:outline-none\n          focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm");
    			add_location(input2, file$5, 158, 8, 4507);
    			attr_dev(div4, "class", "mt-1");
    			add_location(div4, file$5, 157, 6, 4480);
    			add_location(div5, file$5, 153, 4, 4359);
    			attr_dev(label3, "for", "password");
    			attr_dev(label3, "class", "block text-sm font-medium text-gray-700");
    			add_location(label3, file$5, 172, 6, 4946);
    			attr_dev(input3, "id", "habit");
    			attr_dev(input3, "name", "habit");
    			attr_dev(input3, "type", "habit");
    			attr_dev(input3, "autocomplete", "habit");
    			input3.required = true;
    			attr_dev(input3, "class", "appearance-none block w-full px-3 py-2 border border-gray-300\n          rounded-md shadow-sm placeholder-gray-400 focus:outline-none\n          focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm");
    			add_location(input3, file$5, 176, 8, 5079);
    			attr_dev(div6, "class", "mt-1");
    			add_location(div6, file$5, 175, 6, 5052);
    			add_location(div7, file$5, 171, 4, 4934);
    			attr_dev(span0, "class", "sr-only");
    			add_location(span0, file$5, 202, 8, 6069);
    			attr_dev(span1, "aria-hidden", "true");
    			attr_dev(span1, "class", "translate-x-5 inline-block h-5 w-5 rounded-full bg-white shadow\n          transform ring-0 transition ease-in-out duration-200");
    			toggle_class(span1, "translate-x-5", /*userTemp*/ ctx[0].habitType);
    			add_location(span1, file$5, 204, 8, 6177);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "aria-pressed", "false");
    			attr_dev(button0, "aria-labelledby", "toggleLabel");
    			attr_dev(button0, "class", "bg-gray-200 relative inline-flex flex-shrink-0 h-6 w-11 border-2\n        border-transparent rounded-full cursor-pointer transition-colors\n        ease-in-out duration-200 focus:outline-none focus:ring-2\n        focus:ring-offset-2 focus:ring-indigo-500");
    			toggle_class(button0, "bg-indigo-600", /*userTemp*/ ctx[0].habitType);
    			add_location(button0, file$5, 192, 6, 5604);
    			attr_dev(span2, "class", "text-sm font-medium text-gray-900");
    			add_location(span2, file$5, 211, 8, 6478);
    			attr_dev(span3, "class", "ml-3");
    			attr_dev(span3, "id", "toggleLabel");
    			add_location(span3, file$5, 210, 6, 6433);
    			attr_dev(div8, "class", "flex items-center");
    			add_location(div8, file$5, 190, 4, 5511);
    			attr_dev(span4, "class", "text-sm text-gray-500");
    			add_location(span4, file$5, 223, 10, 6884);
    			attr_dev(legend, "class", "block text-sm font-medium text-gray-700");
    			add_location(legend, file$5, 221, 8, 6792);
    			attr_dev(div9, "class", "mt-4 space-y-4");
    			add_location(div9, file$5, 226, 8, 6988);
    			add_location(fieldset, file$5, 220, 6, 6773);
    			attr_dev(div10, "class", "mt-6");
    			add_location(div10, file$5, 219, 4, 6748);
    			attr_dev(button1, "type", "submit");
    			attr_dev(button1, "class", "w-full flex justify-center py-2 px-4 border border-transparent\n        rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600\n        hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2\n        focus:ring-indigo-500");
    			add_location(button1, file$5, 252, 6, 7871);
    			add_location(div11, file$5, 251, 4, 7859);
    			attr_dev(form, "class", "space-y-6");
    			add_location(form, file$5, 116, 2, 3180);
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
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(115:0) <ContentWrapper>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let contentwrapper;
    	let current;

    	contentwrapper = new ContentWrapper({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
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

    			if (dirty & /*$$scope, userTemp*/ 16385) {
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $isLocalStorage;
    	validate_store(isLocalStorage, "isLocalStorage");
    	component_subscribe($$self, isLocalStorage, $$value => $$invalidate(10, $isLocalStorage = $$value));
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
    				replace(`#/error`);
    			} else {
    				if ($isLocalStorage()) {
    					LSuserAuth.set(res.userAuth);
    					LSuserDetails.set(res.userDetails);
    					LSisUserDefined.set(true);
    					console.log("local storage is enabled");
    					replace("/");
    				} else {
    					tempUserDetails.set(res.userDetails);
    					tempIsUserDefined.set(true);
    					console.log("local storage is not available");
    					replace("/");
    				}
    			}
    		}).catch(err => {
    			errMessage.set(res.Error);
    			replace(`#/error`);
    		});
    	};

    	const handleToggleHabitType = () => {
    		$$invalidate(0, userTemp.habitType = !userTemp.habitType, userTemp);
    	};

    	onMount(() => {
    		let dateStart = new Date();
    		let dateEnd = new Date();
    		dateEnd.setDate(dateEnd.getDate() + 21);
    		$$invalidate(0, userTemp.habitDateStartUTCString = dateStart.toUTCString(), userTemp);
    		$$invalidate(0, userTemp.habitDateEndUTCString = dateEnd.toUTCString(), userTemp);
    	}); // console.log("user.habitDateStartUTCString", user.habitDateStartUTCString);
    	// console.log("user.habitDateEndUTCString", user.habitDateEndUTCString);

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<ScreenSignUp> was created with unknown prop '${key}'`);
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
    		push,
    		pop,
    		replace,
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
    		$isLocalStorage
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
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScreenSignUp",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/routes/ScreenAbout.svelte generated by Svelte v3.31.0 */

    const file$6 = "src/routes/ScreenAbout.svelte";

    function create_fragment$7(ctx) {
    	let div5;
    	let div1;
    	let div0;
    	let svg0;
    	let defs0;
    	let pattern0;
    	let rect0;
    	let rect1;
    	let t0;
    	let svg1;
    	let defs1;
    	let pattern1;
    	let rect2;
    	let rect3;
    	let t1;
    	let svg2;
    	let defs2;
    	let pattern2;
    	let rect4;
    	let rect5;
    	let t2;
    	let div4;
    	let div2;
    	let h1;
    	let span0;
    	let t4;
    	let span1;
    	let t6;
    	let p0;
    	let t8;
    	let div3;
    	let p1;
    	let t9;
    	let strong0;
    	let t11;
    	let strong1;
    	let t13;
    	let a0;
    	let t15;
    	let t16;
    	let ul;
    	let li0;
    	let t18;
    	let li1;
    	let t20;
    	let li2;
    	let t22;
    	let p2;
    	let t24;
    	let h20;
    	let t26;
    	let p3;
    	let t28;
    	let blockquote;
    	let p4;
    	let t30;
    	let p5;
    	let t32;
    	let figure;
    	let img;
    	let img_src_value;
    	let t33;
    	let figcaption;
    	let t35;
    	let h21;
    	let t37;
    	let p6;
    	let t38;
    	let a1;
    	let t40;
    	let t41;
    	let p7;

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			svg0 = svg_element("svg");
    			defs0 = svg_element("defs");
    			pattern0 = svg_element("pattern");
    			rect0 = svg_element("rect");
    			rect1 = svg_element("rect");
    			t0 = space();
    			svg1 = svg_element("svg");
    			defs1 = svg_element("defs");
    			pattern1 = svg_element("pattern");
    			rect2 = svg_element("rect");
    			rect3 = svg_element("rect");
    			t1 = space();
    			svg2 = svg_element("svg");
    			defs2 = svg_element("defs");
    			pattern2 = svg_element("pattern");
    			rect4 = svg_element("rect");
    			rect5 = svg_element("rect");
    			t2 = space();
    			div4 = element("div");
    			div2 = element("div");
    			h1 = element("h1");
    			span0 = element("span");
    			span0.textContent = "Introducing";
    			t4 = space();
    			span1 = element("span");
    			span1.textContent = "JavaScript for Beginners";
    			t6 = space();
    			p0 = element("p");
    			p0.textContent = "Aliquet nec orci mattis amet quisque ullamcorper neque, nibh sem. At\n        arcu, sit dui mi, nibh dui, diam eget aliquam. Quisque id at vitae\n        feugiat egestas ac. Diam nulla orci at in viverra scelerisque eget.\n        Eleifend egestas fringilla sapien.";
    			t8 = space();
    			div3 = element("div");
    			p1 = element("p");
    			t9 = text("Faucibus commodo massa rhoncus, volutpat.\n        ");
    			strong0 = element("strong");
    			strong0.textContent = "Dignissim";
    			t11 = text("\n        sed\n        ");
    			strong1 = element("strong");
    			strong1.textContent = "eget risus enim";
    			t13 = text("\n        . Mattis mauris semper sed amet vitae sed turpis id. Id dolor praesent\n        donec est. Odio penatibus risus viverra tellus varius sit neque erat\n        velit. Faucibus commodo massa rhoncus, volutpat. Dignissim sed eget\n        risus enim.\n        ");
    			a0 = element("a");
    			a0.textContent = "Mattis mauris semper";
    			t15 = text("\n        sed amet vitae sed turpis id.");
    			t16 = space();
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "Quis elit egestas venenatis mattis dignissim.";
    			t18 = space();
    			li1 = element("li");
    			li1.textContent = "Cras cras lobortis vitae vivamus ultricies facilisis tempus.";
    			t20 = space();
    			li2 = element("li");
    			li2.textContent = "Orci in sit morbi dignissim metus diam arcu pretium.";
    			t22 = space();
    			p2 = element("p");
    			p2.textContent = "Quis semper vulputate aliquam venenatis egestas sagittis quisque orci.\n        Donec commodo sit viverra aliquam porttitor ultrices gravida eu.\n        Tincidunt leo, elementum mattis elementum ut nisl, justo, amet, mattis.\n        Nunc purus, diam commodo tincidunt turpis. Amet, duis sed elit interdum\n        dignissim.";
    			t24 = space();
    			h20 = element("h2");
    			h20.textContent = "From beginner to expert in 30 days";
    			t26 = space();
    			p3 = element("p");
    			p3.textContent = "Id orci tellus laoreet id ac. Dolor, aenean leo, ac etiam consequat in.\n        Convallis arcu ipsum urna nibh. Pharetra, euismod vitae interdum mauris\n        enim, consequat vulputate nibh. Maecenas pellentesque id sed tellus\n        mauris, ultrices mauris. Tincidunt enim cursus ridiculus mi.\n        Pellentesque nam sed nullam sed diam turpis ipsum eu a sed convallis\n        diam.";
    			t28 = space();
    			blockquote = element("blockquote");
    			p4 = element("p");
    			p4.textContent = "Sagittis scelerisque nulla cursus in enim consectetur quam. Dictum\n          urna sed consectetur neque tristique pellentesque. Blandit amet, sed\n          aenean erat arcu morbi.";
    			t30 = space();
    			p5 = element("p");
    			p5.textContent = "Faucibus commodo massa rhoncus, volutpat. Dignissim sed eget risus enim.\n        Mattis mauris semper sed amet vitae sed turpis id. Id dolor praesent\n        donec est. Odio penatibus risus viverra tellus varius sit neque erat\n        velit.";
    			t32 = space();
    			figure = element("figure");
    			img = element("img");
    			t33 = space();
    			figcaption = element("figcaption");
    			figcaption.textContent = "Sagittis scelerisque nulla cursus in enim consectetur quam.";
    			t35 = space();
    			h21 = element("h2");
    			h21.textContent = "Everything you need to get up and running";
    			t37 = space();
    			p6 = element("p");
    			t38 = text("Purus morbi dignissim senectus mattis\n        ");
    			a1 = element("a");
    			a1.textContent = "adipiscing";
    			t40 = text("\n        . Amet, massa quam varius orci dapibus volutpat cras. In amet eu\n        ridiculus leo sodales cursus tristique. Tincidunt sed tempus ut viverra\n        ridiculus non molestie. Gravida quis fringilla amet eget dui tempor\n        dignissim. Facilisis auctor venenatis varius nunc, congue erat ac. Cras\n        fermentum convallis quam.");
    			t41 = space();
    			p7 = element("p");
    			p7.textContent = "Faucibus commodo massa rhoncus, volutpat. Dignissim sed eget risus enim.\n        Mattis mauris semper sed amet vitae sed turpis id. Id dolor praesent\n        donec est. Odio penatibus risus viverra tellus varius sit neque erat\n        velit.";
    			attr_dev(rect0, "x", "0");
    			attr_dev(rect0, "y", "0");
    			attr_dev(rect0, "width", "4");
    			attr_dev(rect0, "height", "4");
    			attr_dev(rect0, "class", "text-gray-200");
    			attr_dev(rect0, "fill", "currentColor");
    			add_location(rect0, file$6, 42, 12, 1019);
    			attr_dev(pattern0, "id", "74b3fd99-0a6f-4271-bef2-e80eeafdf357");
    			attr_dev(pattern0, "x", "0");
    			attr_dev(pattern0, "y", "0");
    			attr_dev(pattern0, "width", "20");
    			attr_dev(pattern0, "height", "20");
    			attr_dev(pattern0, "patternUnits", "userSpaceOnUse");
    			add_location(pattern0, file$6, 35, 10, 818);
    			add_location(defs0, file$6, 34, 8, 801);
    			attr_dev(rect1, "width", "404");
    			attr_dev(rect1, "height", "384");
    			attr_dev(rect1, "fill", "url(#74b3fd99-0a6f-4271-bef2-e80eeafdf357)");
    			add_location(rect1, file$6, 51, 8, 1232);
    			attr_dev(svg0, "class", "absolute top-12 left-full transform translate-x-32");
    			attr_dev(svg0, "width", "404");
    			attr_dev(svg0, "height", "384");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "viewBox", "0 0 404 384");
    			add_location(svg0, file$6, 28, 6, 629);
    			attr_dev(rect2, "x", "0");
    			attr_dev(rect2, "y", "0");
    			attr_dev(rect2, "width", "4");
    			attr_dev(rect2, "height", "4");
    			attr_dev(rect2, "class", "text-gray-200");
    			attr_dev(rect2, "fill", "currentColor");
    			add_location(rect2, file$6, 71, 12, 1783);
    			attr_dev(pattern1, "id", "f210dbf6-a58d-4871-961e-36d5016a0f49");
    			attr_dev(pattern1, "x", "0");
    			attr_dev(pattern1, "y", "0");
    			attr_dev(pattern1, "width", "20");
    			attr_dev(pattern1, "height", "20");
    			attr_dev(pattern1, "patternUnits", "userSpaceOnUse");
    			add_location(pattern1, file$6, 64, 10, 1582);
    			add_location(defs1, file$6, 63, 8, 1565);
    			attr_dev(rect3, "width", "404");
    			attr_dev(rect3, "height", "384");
    			attr_dev(rect3, "fill", "url(#f210dbf6-a58d-4871-961e-36d5016a0f49)");
    			add_location(rect3, file$6, 80, 8, 1996);
    			attr_dev(svg1, "class", "absolute top-1/2 right-full transform -translate-y-1/2\n        -translate-x-32");
    			attr_dev(svg1, "width", "404");
    			attr_dev(svg1, "height", "384");
    			attr_dev(svg1, "fill", "none");
    			attr_dev(svg1, "viewBox", "0 0 404 384");
    			add_location(svg1, file$6, 56, 6, 1365);
    			attr_dev(rect4, "x", "0");
    			attr_dev(rect4, "y", "0");
    			attr_dev(rect4, "width", "4");
    			attr_dev(rect4, "height", "4");
    			attr_dev(rect4, "class", "text-gray-200");
    			attr_dev(rect4, "fill", "currentColor");
    			add_location(rect4, file$6, 99, 12, 2522);
    			attr_dev(pattern2, "id", "d3eb07ae-5182-43e6-857d-35c643af9034");
    			attr_dev(pattern2, "x", "0");
    			attr_dev(pattern2, "y", "0");
    			attr_dev(pattern2, "width", "20");
    			attr_dev(pattern2, "height", "20");
    			attr_dev(pattern2, "patternUnits", "userSpaceOnUse");
    			add_location(pattern2, file$6, 92, 10, 2321);
    			add_location(defs2, file$6, 91, 8, 2304);
    			attr_dev(rect5, "width", "404");
    			attr_dev(rect5, "height", "384");
    			attr_dev(rect5, "fill", "url(#d3eb07ae-5182-43e6-857d-35c643af9034)");
    			add_location(rect5, file$6, 108, 8, 2735);
    			attr_dev(svg2, "class", "absolute bottom-12 left-full transform translate-x-32");
    			attr_dev(svg2, "width", "404");
    			attr_dev(svg2, "height", "384");
    			attr_dev(svg2, "fill", "none");
    			attr_dev(svg2, "viewBox", "0 0 404 384");
    			add_location(svg2, file$6, 85, 6, 2129);
    			attr_dev(div0, "class", "relative h-full text-lg max-w-prose mx-auto");
    			attr_dev(div0, "aria-hidden", "true");
    			add_location(div0, file$6, 27, 4, 546);
    			attr_dev(div1, "class", "hidden lg:block lg:absolute lg:inset-y-0 lg:h-full lg:w-full");
    			add_location(div1, file$6, 26, 2, 467);
    			attr_dev(span0, "class", "block text-base text-center text-indigo-600 font-semibold\n          tracking-wide uppercase");
    			add_location(span0, file$6, 118, 8, 2993);
    			attr_dev(span1, "class", "mt-2 block text-3xl text-center leading-8 font-extrabold\n          tracking-tight text-gray-900 sm:text-4xl");
    			add_location(span1, file$6, 123, 8, 3156);
    			add_location(h1, file$6, 117, 6, 2980);
    			attr_dev(p0, "class", "mt-8 text-xl text-gray-500 leading-8");
    			add_location(p0, file$6, 129, 6, 3358);
    			attr_dev(div2, "class", "text-lg max-w-prose mx-auto");
    			add_location(div2, file$6, 116, 4, 2932);
    			add_location(strong0, file$6, 139, 8, 3841);
    			add_location(strong1, file$6, 141, 8, 3888);
    			attr_dev(a0, "href", "/#");
    			add_location(a0, file$6, 146, 8, 4181);
    			add_location(p1, file$6, 137, 6, 3779);
    			add_location(li0, file$6, 150, 8, 4287);
    			add_location(li1, file$6, 151, 8, 4350);
    			add_location(li2, file$6, 152, 8, 4428);
    			add_location(ul, file$6, 149, 6, 4274);
    			add_location(p2, file$6, 154, 6, 4508);
    			add_location(h20, file$6, 161, 6, 4860);
    			add_location(p3, file$6, 162, 6, 4910);
    			add_location(p4, file$6, 171, 8, 5348);
    			add_location(blockquote, file$6, 170, 6, 5327);
    			add_location(p5, file$6, 177, 6, 5581);
    			attr_dev(img, "class", "w-full rounded-lg");
    			if (img.src !== (img_src_value = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&w=1310&h=873&q=80&facepad=3")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "width", "1310");
    			attr_dev(img, "height", "873");
    			add_location(img, file$6, 184, 8, 5869);
    			add_location(figcaption, file$6, 190, 8, 6129);
    			add_location(figure, file$6, 183, 6, 5852);
    			add_location(h21, file$6, 194, 6, 6256);
    			attr_dev(a1, "href", "/#");
    			add_location(a1, file$6, 197, 8, 6371);
    			add_location(p6, file$6, 195, 6, 6313);
    			add_location(p7, file$6, 204, 6, 6759);
    			attr_dev(div3, "class", "mt-6 prose prose-indigo prose-lg text-gray-500 mx-auto");
    			add_location(div3, file$6, 136, 4, 3704);
    			attr_dev(div4, "class", "relative px-4 sm:px-6 lg:px-8");
    			add_location(div4, file$6, 115, 2, 2884);
    			attr_dev(div5, "class", "relative py-16 bg-white overflow-hidden");
    			add_location(div5, file$6, 25, 0, 411);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div1);
    			append_dev(div1, div0);
    			append_dev(div0, svg0);
    			append_dev(svg0, defs0);
    			append_dev(defs0, pattern0);
    			append_dev(pattern0, rect0);
    			append_dev(svg0, rect1);
    			append_dev(div0, t0);
    			append_dev(div0, svg1);
    			append_dev(svg1, defs1);
    			append_dev(defs1, pattern1);
    			append_dev(pattern1, rect2);
    			append_dev(svg1, rect3);
    			append_dev(div0, t1);
    			append_dev(div0, svg2);
    			append_dev(svg2, defs2);
    			append_dev(defs2, pattern2);
    			append_dev(pattern2, rect4);
    			append_dev(svg2, rect5);
    			append_dev(div5, t2);
    			append_dev(div5, div4);
    			append_dev(div4, div2);
    			append_dev(div2, h1);
    			append_dev(h1, span0);
    			append_dev(h1, t4);
    			append_dev(h1, span1);
    			append_dev(div2, t6);
    			append_dev(div2, p0);
    			append_dev(div4, t8);
    			append_dev(div4, div3);
    			append_dev(div3, p1);
    			append_dev(p1, t9);
    			append_dev(p1, strong0);
    			append_dev(p1, t11);
    			append_dev(p1, strong1);
    			append_dev(p1, t13);
    			append_dev(p1, a0);
    			append_dev(p1, t15);
    			append_dev(div3, t16);
    			append_dev(div3, ul);
    			append_dev(ul, li0);
    			append_dev(ul, t18);
    			append_dev(ul, li1);
    			append_dev(ul, t20);
    			append_dev(ul, li2);
    			append_dev(div3, t22);
    			append_dev(div3, p2);
    			append_dev(div3, t24);
    			append_dev(div3, h20);
    			append_dev(div3, t26);
    			append_dev(div3, p3);
    			append_dev(div3, t28);
    			append_dev(div3, blockquote);
    			append_dev(blockquote, p4);
    			append_dev(div3, t30);
    			append_dev(div3, p5);
    			append_dev(div3, t32);
    			append_dev(div3, figure);
    			append_dev(figure, img);
    			append_dev(figure, t33);
    			append_dev(figure, figcaption);
    			append_dev(div3, t35);
    			append_dev(div3, h21);
    			append_dev(div3, t37);
    			append_dev(div3, p6);
    			append_dev(p6, t38);
    			append_dev(p6, a1);
    			append_dev(p6, t40);
    			append_dev(div3, t41);
    			append_dev(div3, p7);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
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
    	validate_slots("ScreenAbout", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ScreenAbout> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class ScreenAbout extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScreenAbout",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/routes/ScreenError.svelte generated by Svelte v3.31.0 */
    const file$7 = "src/routes/ScreenError.svelte";

    function create_fragment$8(ctx) {
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
    			add_location(div, file$7, 4, 0, 65);
    			attr_dev(a, "href", "/#/start");
    			add_location(a, file$7, 5, 0, 97);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, a, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$errMessage*/ 1) set_data_dev(t1, /*$errMessage*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(a);
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

    	$$self.$capture_state = () => ({ errMessage, $errMessage });
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

    const { console: console_1$2 } = globals;

    function create_fragment$9(ctx) {
    	let router;
    	let current;
    	router = new Router({ props: { routes }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
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
    			destroy_component(router, detaching);
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
    	let $LSuserAuth;
    	let $LSuserDetails;
    	let $LSisUserDefined;
    	validate_store(LSuserAuth, "LSuserAuth");
    	component_subscribe($$self, LSuserAuth, $$value => $$invalidate(0, $LSuserAuth = $$value));
    	validate_store(LSuserDetails, "LSuserDetails");
    	component_subscribe($$self, LSuserDetails, $$value => $$invalidate(1, $LSuserDetails = $$value));
    	validate_store(LSisUserDefined, "LSisUserDefined");
    	component_subscribe($$self, LSisUserDefined, $$value => $$invalidate(2, $LSisUserDefined = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	onMount(() => {
    		console.log("LSuserAuth", $LSuserAuth);
    		console.log("LSuserDetails", $LSuserDetails);
    		console.log("LSisUserDefined", $LSisUserDefined);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Router,
    		routes,
    		LSuserAuth,
    		LSuserDetails,
    		LSisUserDefined,
    		onMount,
    		$LSuserAuth,
    		$LSuserDetails,
    		$LSisUserDefined
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$9.name
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
