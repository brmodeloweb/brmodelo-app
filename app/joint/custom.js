import * as joint from "jointjs/dist/joint";

function measureText(svgDocument, text, attrs) {
  const vText = joint.V("text").attr(attrs).text(text);
  vText.appendTo(svgDocument);
  const bbox = vText.getBBox();
  vText.remove();
  return bbox;
}

class Note extends joint.dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: "custom.Note",
      fillColor: "#FCFCFC",
      outlineColor: "#A3A5A5",
      label: "",
      image: "",
	  supertype: "note"
    };
  }

  preinitialize() {
    this.spacing = 10;
    this.labelAttributes = {
      "font-size": 14,
      "font-family": "sans-serif"
    };
    this.imageAttributes = {
      width: 50,
      height: 50,
      preserveAspectRatio: "none"
    };
    this.cache = {};
  }

  initialize(paper) {
	this.paper = paper;
    super.initialize();
    this.on("change", this.onAttributeChange);
    this.setSizeFromContent();
  }

  /* Attributes that affects the size of the model. */
  onAttributeChange() {
    const { changed, cache } = this;
    if ("label" in changed) {
      // invalidate the cache only if the text of the `label` has changed
      delete cache.label;
    }
    if ("label" in changed || "image" in changed) {
      this.setSizeFromContent();
    }
  }

  setSizeFromContent() {
    delete this.cache.layout;
    const { width, height } = this.layout();
    this.resize(width, height);
  }

  layout() {
    const { cache } = this;
    let { layout } = cache;
    if (layout) {
      return layout;
    } else {
      const layout = this.calcLayout();
      cache.layout = layout;
      return layout;
    }
  }

  calcLayout() {
    const {
      attributes,
      labelAttributes,
      imageAttributes,
      spacing,
      cache
    } = this;
    let width = spacing * 2;
    let height = spacing * 2;
    let x = spacing;
    let y = spacing;
    // image metrics
    let $image;
    if (attributes.image) {
      const { width: w, height: h } = imageAttributes;
      $image = {
        x,
        y,
        width: w,
        height: h
      };
      height += spacing + h;
      y += spacing + h;
      width += w;
    } else {
      $image = null;
    }
    // label metrics
    let $label;
    {
      let w, h;
      if ("label" in cache) {
        w = cache.label.width;
        h = cache.label.height;
      } else {
        const { width, height } = measureText(
		  this.paper.svg,
          attributes.label,
          labelAttributes
        );
        w = width;
        h = height;
        cache.label = {
          width,
          height
        };
      }
      width = Math.max(width, spacing + w + spacing);
      height += h;
      if (!h) {
        // no text
        height -= spacing;
      }
      $label = {
        x,
        y,
        width: w,
        height: h
      };
    }
    // root metrics
    return {
      x: 0,
      y: 0,
      width,
      height,
      $image,
      $label
    };
  }
}

const ElementView = joint.dia.ElementView;

const NoteView = ElementView.extend({

	initialize: function () {
		joint.dia.ElementView.prototype.initialize.apply(this, arguments);
	  },

  presentationAttributes: ElementView.addPresentationAttributes({
    // attributes that changes the position and size of the DOM elements
    label: [ElementView.Flags.UPDATE],
    image: [ElementView.Flags.UPDATE],
    // attributes that do not affect the size
    outlineColor: ["@color"],
    fillColor: ["@color"]
  }),

  confirmUpdate: function (...args) {
    let flags = ElementView.prototype.confirmUpdate.call(this, ...args);
    if (this.hasFlag(flags, "@color")) {
      // if only a color is changed, no need to resize the DOM elements
      this.updateColors();
      flags = this.removeFlag(flags, "@color");
    }
    // must return 0
    return flags;
  },

  /* Runs only once while initializing */
  render: function () {
    const { vel, model } = this;
    const body = (this.vBody = joint.V("rect")
      .addClass("body")
      .attr("stroke-width", 1));
    const label = (this.vLabel = joint.V("text")
      .addClass("label")
      .attr(model.labelAttributes));
    this.vImage = joint.V("image").addClass("image").attr(model.imageAttributes);
    vel.empty().append([body, label]);
    this.update();
    this.updateColors();
    this.translate(); // default element translate method
  },

  update: function () {
    const layout = this.model.layout();
    this.updateBody(layout);
    this.updateImage(layout.$image);
    this.updateLabel(layout.$label);
  },

  updateColors: function () {
    const { model, vBody } = this;
    vBody.attr({
      fill: model.get("fillColor"),
      stroke: model.get("outlineColor")
    });
  },

  updateBody: function () {
    const { model, vBody } = this;
    const { width, height } = model.size();
    const bodyAttributes = {
      width,
      height
    };
    vBody.attr(bodyAttributes);
  },

  updateImage: function ($image) {
    const { model, vImage, vel } = this;
    const image = model.get("image");
    if (image) {
      if (!vImage.parent()) {
        vel.append(vImage);
      }
      vImage.attr({
        "xlink:href": image,
        x: $image.x,
        y: $image.y
      });
    } else {
      vImage.remove();
    }
  },

  updateLabel: function ($label) {
    const { model, vLabel } = this;
    vLabel.attr({
      "text-anchor": "middle",
      x: $label.x + $label.width / 2,
      y: $label.y + $label.height / 2
    });
    vLabel.text(model.get("label"), {
      textVerticalAnchor: "middle"
    });
  }
});

joint.shapes.custom = {
  Note,
  NoteView
};

export default joint.shapes.custom;

