import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

interface BlockInfo {
	id: string;
	name: string;
	path: number[];
	parentPath: number[];
}

interface DisjunctionGroup {
	id: string;
	blockIds: string[];
}

interface UpdateEvent {
	type: string;
	element?: any;
	value?: any;
	groupId?: string;
}

interface DisjunctionGroupsEditorProps {
	element: any;
	onUpdate: (event: UpdateEvent) => void;
	showFeedback: (message: string, showing: boolean, type?: "success" | "error" | "warning") => void;
	// Bumps when external mutations (e.g. row add/delete from attributes panel)
	// change the collection — forces memoized useMemos to recompute.
	externalVersion?: number;
}

const pathsEqual = (a: number[], b: number[]): boolean => {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
	return true;
};

const formatBlockLabel = (block: BlockInfo, allBlocks: BlockInfo[]): string => {
	if (block.parentPath.length === 0) return block.name;
	const trail: string[] = [];
	for (let i = 1; i <= block.parentPath.length; i++) {
		const ancestorPath = block.parentPath.slice(0, i);
		const ancestor = allBlocks.find(b => pathsEqual(b.path, ancestorPath));
		if (ancestor) trail.push(ancestor.name);
	}
	return trail.length ? `${trail.join(" / ")} / ${block.name}` : block.name;
};

const DisjunctionGroupsEditor: React.FC<DisjunctionGroupsEditorProps> = React.memo(({
	element,
	onUpdate,
	showFeedback,
	externalVersion = 0,
}) => {
	const { t } = useTranslation(["common"]);
	const model = element?.model;

	const [version, setVersion] = useState(0);
	const refresh = useCallback(() => setVersion(v => v + 1), []);

	const [creating, setCreating] = useState(false);
	const [newBlockIds, setNewBlockIds] = useState<string[]>([]);
	const [hoveredReasonId, setHoveredReasonId] = useState<string | null>(null);

	const allBlocks: BlockInfo[] = useMemo(() => {
		if (!model?.getAllBlocks) return [];
		return model.getAllBlocks();
	}, [model, element, version, externalVersion]);

	// v1: disjunção só entre blocos no nível raiz da coleção
	const selectableBlocks: BlockInfo[] = useMemo(
		() => allBlocks.filter(b => b.parentPath.length === 0),
		[allBlocks],
	);

	const groups: DisjunctionGroup[] = useMemo(() => {
		if (!model?.getDisjunctionGroups) return [];
		return model.getDisjunctionGroups();
	}, [model, element, version, externalVersion]);

	const blockById = useMemo(() => {
		const map = new Map<string, BlockInfo>();
		allBlocks.forEach(b => map.set(b.id, b));
		return map;
	}, [allBlocks]);

	const cancelCreate = useCallback(() => {
		setCreating(false);
		setNewBlockIds([]);
	}, []);

	const toggleNewBlock = useCallback((blockId: string) => {
		setNewBlockIds(prev => prev.includes(blockId) ? prev.filter(id => id !== blockId) : [...prev, blockId]);
	}, []);

	const alreadyGroupedIds: Set<string> = useMemo(() => {
		const set = new Set<string>();
		groups.forEach(g => g.blockIds.forEach(id => set.add(id)));
		return set;
	}, [groups]);

	const disabledReason = useCallback((block: BlockInfo): string | null => {
		if (alreadyGroupedIds.has(block.id)) return t("already in another group");
		if (newBlockIds.length > 0) {
			const first = blockById.get(newBlockIds[0]);
			if (first && !pathsEqual(block.parentPath, first.parentPath)) return t("not a sibling");
		}
		return null;
	}, [alreadyGroupedIds, newBlockIds, blockById, t]);

	const confirmCreate = useCallback(() => {
		if (newBlockIds.length < 2) {
			showFeedback(t("At least 2 blocks required"), true, "error");
			return;
		}
		onUpdate({
			type: "addDisjunctionGroup",
			element,
			value: { blockIds: newBlockIds },
		});
		cancelCreate();
		refresh();
	}, [newBlockIds, onUpdate, element, showFeedback, t, cancelCreate, refresh]);

	const deleteGroup = useCallback((groupId: string) => {
		onUpdate({ type: "deleteDisjunctionGroup", element, groupId });
		refresh();
	}, [onUpdate, element, refresh]);

	if (selectableBlocks.length < 2) {
		return (
			<div
				style={{
					margin: 8,
					padding: 16,
					border: "1px dashed #d0d0d0",
					borderRadius: 4,
					textAlign: "center",
					fontSize: 12,
					color: "#666",
				}}
			>
				{t("Add 2 or more blocks to create a disjunction.")}
			</div>
		);
	}

	return (
		<>
			{groups.map(group => (
				<div
					key={group.id}
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: 8,
						padding: 8,
						marginBottom: 6,
						border: "1px solid #e0e0e0",
						borderRadius: 4,
					}}
				>
					<div style={{ display: "flex", flexWrap: "wrap", gap: 4, flex: 1 }}>
						{group.blockIds.map(id => {
							const b = blockById.get(id);
							const label = b ? formatBlockLabel(b, allBlocks) : id;
							return (
								<span
									key={id}
									style={{
										padding: "2px 8px",
										background: "#eef",
										borderRadius: 10,
										fontSize: 12,
									}}
								>
									{label}
								</span>
							);
						})}
					</div>
					<button
						type="button"
						onClick={() => deleteGroup(group.id)}
						aria-label={t("Delete")}
						title={t("Delete")}
						style={{
							border: "none",
							background: "transparent",
							cursor: "pointer",
							color: "#888",
							padding: 4,
							fontSize: 14,
							lineHeight: 1,
						}}
					>
						<FontAwesomeIcon icon="trash" />
					</button>
				</div>
			))}

			{creating ? (
				<div className="card-item" style={{ marginBottom: 8 }}>
					<div style={{ padding: 8 }}>
						<div className="form-group" style={{ marginBottom: 8 }}>
							<label>{t("Members")}</label>
							<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
								{selectableBlocks.map(b => {
									const reason = disabledReason(b);
									const disabled = reason !== null;
									return (
										<label
											key={b.id}
											style={{
												display: "flex",
												alignItems: "center",
												gap: 6,
												fontSize: 13,
												opacity: disabled ? 0.5 : 1,
												cursor: disabled ? "not-allowed" : "pointer",
											}}
										>
											<input
												type="checkbox"
												checked={newBlockIds.includes(b.id)}
												disabled={disabled}
												onChange={() => toggleNewBlock(b.id)}
											/>
											<span>{formatBlockLabel(b, allBlocks)}</span>
											{reason && (
												<span
													style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
													onMouseEnter={() => setHoveredReasonId(b.id)}
													onMouseLeave={() => setHoveredReasonId(null)}
												>
													<FontAwesomeIcon
														icon="circle-info"
														aria-label={reason}
														style={{ color: "#888", fontSize: 12 }}
													/>
													{hoveredReasonId === b.id && (
														<span
															role="tooltip"
															style={{
																position: "absolute",
																left: 18,
																top: "50%",
																transform: "translateY(-50%)",
																background: "#333",
																color: "#fff",
																padding: "2px 6px",
																borderRadius: 3,
																fontSize: 11,
																whiteSpace: "nowrap",
																pointerEvents: "none",
																zIndex: 10,
															}}
														>
															{reason}
														</span>
													)}
												</span>
											)}
										</label>
									);
								})}
							</div>
						</div>
						<div style={{ display: "flex", gap: 8 }}>
							<button type="button" className="br-button" onClick={confirmCreate}>
								{t("Save")}
							</button>
							<button type="button" className="br-button br-button--secondary" onClick={cancelCreate}>
								{t("Cancel")}
							</button>
						</div>
					</div>
				</div>
			) : (
				<button
					className="br-button br-button--full"
					style={{ marginBottom: 8 }}
					onClick={() => setCreating(true)}
				>
					{t("Add disjunction")}
				</button>
			)}
		</>
	);
});

DisjunctionGroupsEditor.displayName = "DisjunctionGroupsEditor";

export default DisjunctionGroupsEditor;
