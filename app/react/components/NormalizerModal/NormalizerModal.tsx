import React, { useState } from "react";

import { useTranslation } from "react-i18next";

import Dialog from "../Dialog";
import { normalizeTable } from "@pages/logic/normalization/normalizer";

export interface NormalizerModalProps {
	open: boolean;
	tables: any[];
	onSuccess: (result: any[]) => void;
	onCancel: () => void;
}

type DependencySide = "left" | "right";
type CurrentDependency = Record<DependencySide, string[]>;

const ATTRIBUTE_DRAG_TYPE = "application/x-brmodelo-attribute";

const NormalizerModal: React.FC<NormalizerModalProps> = ({
	open,
	tables,
	onSuccess,
	onCancel,
}) => {
	const { t } = useTranslation(["common"]);

	const [selectedTable, setSelectedTable] = useState(0);
	const [dependenciesByTable, setDependenciesByTable] = useState<
		Record<number, any[]>
	>({});
	const [currentDF, setCurrentDF] = useState<CurrentDependency>({
		left: [],
		right: [],
	});
	const [draggedAttribute, setDraggedAttribute] = useState<string | null>(null);
	const [dragOverSide, setDragOverSide] = useState<DependencySide | null>(null);

	const dependencies = dependenciesByTable[selectedTable] ?? [];
	const selectedTableData = tables[selectedTable];
	const attributes =
		selectedTableData?.attributes ??
		selectedTableData?.columns?.map(
			(column: { name?: string }) => column.name,
		) ??
		[];

	const isAttributeDrag = (dataTransfer: DataTransfer) =>
		Array.from(dataTransfer.types).includes(ATTRIBUTE_DRAG_TYPE);

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) return;

		onCancel();
	};

	const selectTable = (index: number) => {
		setSelectedTable(index);
		setCurrentDF({ left: [], right: [] });
		setDragOverSide(null);
	};

	const addAttributeToSide = (attribute: string, side: "left" | "right") => {
		setCurrentDF((current) => {
			const otherSide = side === "left" ? "right" : "left";
			const nextOtherSide = current[otherSide].filter(
				(item) => item !== attribute,
			);

			return {
				...current,
				[otherSide]: nextOtherSide,
				[side]: current[side].includes(attribute)
					? current[side]
					: [...current[side], attribute],
			};
		});
	};

	const removeFromCurrentDF = (attribute: string) => {
		setCurrentDF((current) => ({
			left: current.left.filter((item) => item !== attribute),
			right: current.right.filter((item) => item !== attribute),
		}));
	};

	const addDependencyFromDrag = () => {
		if (currentDF.left.length === 0 || currentDF.right.length === 0) return;

		setDependenciesByTable((currentByTable) => ({
			...currentByTable,
			[selectedTable]: [
				...(currentByTable[selectedTable] ?? []),
				{ left: [...currentDF.left], right: [...currentDF.right] },
			],
		}));
		setCurrentDF({ left: [], right: [] });
	};

	const handleNormalize = () => {
		if (tables.length === 0) {
			return;
		}

		const result = tables.flatMap((table, index) =>
			normalizeTable({
				...table,
				dependencies: dependenciesByTable[index] ?? [],
			}),
		);

		onSuccess(result);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}
			title="Normalização"
			closeOnOverlayClick
			closeOnEscape
		>
			<div className="modal-body">
				<form className="form-horizontal" role="form">
					<div className="form-group">
						<label className="control-label col-sm-12">
							Tabela selecionada:{" "}
							<strong>{selectedTableData?.name ?? "nenhuma"}</strong>
						</label>
						<div
							className="col-sm-12"
							style={{
								display: "flex",
								gap: 8,
								overflowX: "auto",
								padding: "4px 4px 12px",
							}}
						>
							{tables.map((table, index) => (
								<button
									key={table.id ?? index}
									type="button"
									className={`br-button${selectedTable === index ? " primary" : ""}`}
									aria-pressed={selectedTable === index}
									title={
										selectedTable === index
											? "Tabela selecionada"
											: `Selecionar ${table.name}`
									}
									onClick={() => selectTable(index)}
									style={{
										flex: "0 0 auto",
										cursor: selectedTable === index ? "default" : "pointer",
										fontWeight: selectedTable === index ? 700 : 400,
										boxShadow:
											selectedTable === index
												? "0 0 0 2px rgba(0, 98, 152, 0.25)"
												: undefined,
									}}
								>
									{table.name}
								</button>
							))}
						</div>
					</div>

					<div className="form-group">
						<label className="control-label col-sm-12">
							Atributos de {selectedTableData?.name ?? "tabela"}
						</label>
						<div
							className="col-sm-12"
							style={{
								display: "flex",
								flexWrap: "wrap",
								gap: 8,
								maxHeight: 120,
								overflowY: "auto",
							}}
						>
							{attributes.map((attribute: string) => (
								<button
									key={attribute}
									type="button"
									draggable
									className="br-button"
									onDragStart={(event) => {
										event.dataTransfer.setData(ATTRIBUTE_DRAG_TYPE, attribute);
										event.dataTransfer.setData("text/plain", attribute);
										event.dataTransfer.effectAllowed = "move";
										setDraggedAttribute(attribute);
									}}
									onDragEnd={(event) => {
										if (event.dataTransfer.dropEffect === "none") {
											removeFromCurrentDF(attribute);
										}
										setDraggedAttribute(null);
										setDragOverSide(null);
									}}
									style={{
										flex: "0 0 auto",
										cursor:
											draggedAttribute === attribute ? "grabbing" : "grab",
									}}
								>
									{attribute}
								</button>
							))}
						</div>
					</div>

					<div className="form-group">
						<label className="control-label col-sm-12">
							Nova dependência funcional
						</label>
						<div
							className="col-sm-12"
							style={{ display: "flex", gap: 8, alignItems: "stretch" }}
						>
							{(["left", "right"] as const).map((side) => (
								<div
									key={side}
									onDragEnter={(event) => {
										if (isAttributeDrag(event.dataTransfer)) {
											setDragOverSide(side);
										}
									}}
									onDragLeave={() => setDragOverSide(null)}
									onDragOver={(event) => {
										if (!isAttributeDrag(event.dataTransfer)) return;
										event.preventDefault();
										event.dataTransfer.dropEffect = "move";
										setDragOverSide(side);
									}}
									onDrop={(event) => {
										event.preventDefault();
										const attribute = isAttributeDrag(event.dataTransfer)
											? event.dataTransfer.getData(ATTRIBUTE_DRAG_TYPE)
											: "";
										if (attribute && attributes.includes(attribute)) {
											addAttributeToSide(attribute, side);
										}
										setDraggedAttribute(null);
										setDragOverSide(null);
									}}
									style={{
										flex: 1,
										minHeight: 64,
										padding: 8,
										border:
											dragOverSide === side
												? "2px solid #006298"
												: "1px dashed #888",
										background: dragOverSide === side ? "#e8f3f8" : "#f7f7f7",
										cursor: draggedAttribute ? "copy" : "default",
										transition:
											"border-color 120ms ease, background-color 120ms ease",
									}}
								>
									<strong>
										{side === "left" ? "Determinante" : "Dependente"}
									</strong>
									<div
										style={{
											display: "flex",
											flexWrap: "wrap",
											gap: 4,
											marginTop: 8,
										}}
									>
										{currentDF[side].map((attribute) => (
											<button
												key={attribute}
												type="button"
												className="br-button"
												onClick={() => removeFromCurrentDF(attribute)}
												title="Remover da dependência em construção"
												style={{ cursor: "pointer" }}
											>
												{attribute}
											</button>
										))}
									</div>
								</div>
							))}
						</div>
						<div className="col-sm-12" style={{ marginTop: 8 }}>
							<button
								className="br-button"
								type="button"
								disabled={!currentDF.left.length || !currentDF.right.length}
								onClick={addDependencyFromDrag}
							>
								Adicionar DF
							</button>
						</div>
					</div>

					<div className="form-group">
						<label className="control-label col-sm-12">
							Dependências adicionadas
						</label>
						<div
							className="col-sm-12"
							style={{ maxHeight: 150, overflowY: "auto" }}
						>
							{dependencies.map((dependency, index) => (
								<div
									key={index}
									style={{
										display: "flex",
										alignItems: "center",
										gap: 8,
										marginBottom: 8,
									}}
								>
									<span>
										{dependency.left.join(", ")} → {dependency.right.join(", ")}
									</span>
									<button
										className="br-button"
										type="button"
										onClick={() =>
											setDependenciesByTable((current) => ({
												...current,
												[selectedTable]: (current[selectedTable] ?? []).filter(
													(_, itemIndex) => itemIndex !== index,
												),
											}))
										}
									>
										Remover
									</button>
								</div>
							))}
						</div>
					</div>
				</form>
			</div>

			<div className="modal-footer">
				<button className="br-button" type="button" onClick={onCancel}>
					{t("Cancel")}
				</button>

				<button
					className="br-button primary"
					type="button"
					onClick={handleNormalize}
				>
					Normalizar
				</button>
			</div>
		</Dialog>
	);
};

export default NormalizerModal;
