// Mock for @joint/core package used in tests
// This mock provides the shapes object with all necessary ERD shape constructors

// Mock dia.Element.define and dia.Link.define functions
const dia = {
	Element: {
		define: (type, defaultAttrs, prototypeProps) => {
			class MockDiaElement {
				constructor(attrs = {}) {
					this.attributes = {
						type,
						...defaultAttrs,
						...attrs,
					};
					this._listeners = {};
					if (this.initialize) this.initialize();
				}
				get(key) {
					return this.attributes[key];
				}
				set(key, value) {
					this.attributes[key] = value;
					const eventName = `change:${key}`;
					if (this._listeners[eventName]) {
						this._listeners[eventName].forEach(fn => fn.call(this));
					}
				}
				on(event, fn, ctx) {
					event.split(' ').forEach(e => {
						if (!this._listeners[e]) this._listeners[e] = [];
						this._listeners[e].push(fn.bind(ctx || this));
					});
				}
				trigger(event) {
					if (this._listeners[event]) {
						this._listeners[event].forEach(fn => fn.call(this));
					}
				}
				attr() { return {}; }
				removeAttr() {}
				resize() {}
			}
			MockDiaElement.prototype.initialize = dia.Element.prototype?.initialize || function() {};
			if (prototypeProps) {
				Object.assign(MockDiaElement.prototype, prototypeProps);
			}
			return MockDiaElement;
		},
		prototype: {
			initialize: { apply: function() {} }
		}
	},
	Link: {
		define: (type, defaultAttrs, prototypeProps) => {
			class MockDiaLink {
				constructor(attrs = {}) {
					this.attributes = {
						type,
						...defaultAttrs,
						...attrs,
					};
				}
			}
			if (prototypeProps) {
				Object.assign(MockDiaLink.prototype, prototypeProps);
			}
			return MockDiaLink;
		}
	},
	ElementView: {
		extend: () => class MockElementView {}
	}
};

// Mock linkTools
const linkTools = {
	Button: {
		extend: (config) => {
			return class MockLinkToolButton {
				constructor(attrs = {}) {
					this.config = { ...config, ...attrs };
				}
			};
		}
	}
};

class MockShape {
	constructor(config = {}) {
		this.attributes = {
			...config,
		};
		this.graph = config.graph || null;
	}
}

class Entity extends MockShape {
	constructor(config = {}) {
		super(config);
		this.attributes = {
			type: 'erd.Entity',
			supertype: 'Entity',
			isExtended: false,
			autorelationship: false,
			...config,
		};
	}
}

class Relationship extends MockShape {
	constructor(config = {}) {
		super(config);
		this.attributes = {
			type: 'erd.Relationship',
			supertype: 'Relationship',
			autorelationship: false,
			...config,
		};
	}
}

class ISA extends MockShape {
	constructor(config = {}) {
		super(config);
		this.attributes = {
			type: 'erd.ISA',
			supertype: 'Inheritance',
			parentId: null,
			...config,
		};
	}
}

class Associative extends MockShape {
	constructor(config = {}) {
		super(config);
		this.attributes = {
			type: 'erd.Associative',
			supertype: 'Associative',
			...config,
		};
	}
}

class Attribute extends MockShape {
	constructor(config = {}) {
		super(config);
		this.attributes = {
			type: 'erd.Attribute',
			supertype: 'Attribute',
			multivalued: false,
			composed: false,
			...config,
		};
	}
}

class Key extends MockShape {
	constructor(config = {}) {
		super(config);
		this.attributes = {
			type: 'erd.Key',
			supertype: 'Key',
			multivalued: false,
			composed: false,
			...config,
		};
	}
}

class Link extends MockShape {
	constructor(config = {}) {
		super(config);
		this.attributes = {
			type: 'erd.Link',
			weak: false,
			...config,
		};
	}
}

class BlockAssociative extends MockShape {
	constructor(config = {}) {
		super(config);
		this.attributes = {
			type: 'erd.BlockAssociative',
			supertype: 'BlockAssociative',
			...config,
		};
	}
}

// Export shapes object that matches the @joint/core API
export const shapes = {
	Entity,
	Relationship,
	ISA,
	Associative,
	Attribute,
	Key,
	Link,
	BlockAssociative,
};

// Export dia and linkTools
export { dia, linkTools };