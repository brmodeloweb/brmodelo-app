import React, { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface DropdownOption {
	name: string;
	type: string;
}

interface DropdownProps {
	options: DropdownOption[];
	selected: DropdownOption;
	onSelect: (option: DropdownOption) => void;
	disabled?: boolean;
}

const Dropdown: React.FC<DropdownProps> = React.memo(({ options, selected, onSelect, disabled }) => {
	const { t } = useTranslation(["common"]);
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const handleSelect = useCallback((option: DropdownOption) => {
		onSelect(option);
		setOpen(false);
	}, [onSelect]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const handleFocusOut = (event: FocusEvent) => {
			if (container.contains(event.relatedTarget as Node | null)) return;
			setOpen(false);
		};

		container.addEventListener("focusout", handleFocusOut);
		return () => {
			container.removeEventListener("focusout", handleFocusOut);
		};
	}, []);

	return (
		<div
			ref={containerRef}
			className={`dropdown-tmp dropdown-tmp-btn${open ? " expanded" : ""}`}
		>
			<div className="dropdown-tmp-trigger">
				<button
					type="button"
					className="btn ng-binding"
					disabled={disabled}
					aria-haspopup="listbox"
					aria-expanded={open}
					onClick={() => setOpen(!open)}
				>
					{t(selected.name)}
				</button>
			</div>
			<ul className="dropdown-tmp-list" role="listbox" style={{ minWidth: 140 }}>
				{options.map((option) => (
					<li
						key={option.type}
						className="dropdown-tmp-item"
						role="option"
						onMouseDown={() => handleSelect(option)}
					>
						<span>{t(option.name)}</span>
					</li>
				))}
			</ul>
		</div>
	);
});

Dropdown.displayName = "Dropdown";

export default Dropdown;
