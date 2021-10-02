
export default class EntityExtensor {

    constructor(shapeFactory, shapeValidator, linker) {
        this.factory = shapeFactory;
        this.validator = shapeValidator;
        this.linker = linker;
    }

    createExtension = (entity, extentionType) => {
        const x = entity.model.attributes.position.x;
        const y = entity.model.attributes.position.y;

        const isa = this.factory.createIsa();
        const extendedEntity = this.factory.createEntity();

        isa.attributes.position.x = x + 18;
        isa.attributes.position.y = y + 60;
        isa.attributes.attrs.text.text = extentionType;

        extendedEntity.attributes.position.x = x;
        extendedEntity.attributes.position.y = y + 120;

        const graph = entity.model.graph;

        graph.addCell(isa);
        graph.addCell(extendedEntity);

        this.linker.createLink(isa, entity.model, graph);

        entity.model.attributes.isExtended = true;
        isa.attributes.parentId = entity.model.attributes.id;

        this.linker.createLink(isa, extendedEntity, graph);
    };

    updateExtension = (entity, extentionType) => {
        const graph = entity.model.graph;
        const paper = entity.paper;

        const neighbors = graph.getNeighbors(entity.model);
        const extension = neighbors.find(element => {
            return this.validator.isExtension(element) && element.attributes.parentId == entity.model.attributes.id;
        });

        if(extension != null) {
            extension.attributes.attrs.text.text = extentionType;
            const extensionView = extension.findView(paper);
            extensionView.update();
        }

        return extension;
    }

}