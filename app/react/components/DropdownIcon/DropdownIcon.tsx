import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export interface DropdownOption {
	name: string;
	type: string;
}

interface DropdownIconProps {
	options: DropdownOption[];
	onSelect: (option: DropdownOption) => void;
}

export const DropdownIcon: React.FC<DropdownIconProps> = React.memo(({ options, onSelect }) => {
	const { t } = useTranslation(["common"]);
	const [dropdownOpen, setDropdownOpen] = useState(false);

	// Handle click outside dropdown
	useEffect(() => {
		const handleClickOutside = () => {
			if (dropdownOpen) {
				setDropdownOpen(false);
			}
		};

		if (dropdownOpen) {
			document.addEventListener('click', handleClickOutside);
		}

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	}, [dropdownOpen]);

	const handleDropdownToggle = (e: React.MouseEvent) => {
		e.stopPropagation();
		setDropdownOpen(!dropdownOpen);
	};

	const handleMenuOptionSelected = (e: React.MouseEvent, option: DropdownOption) => {
		e.preventDefault();
		e.stopPropagation();
		setDropdownOpen(false);
		onSelect(option);
	};

	return (
		<div className={`dropdown ${dropdownOpen ? "open" : ""}`}>
			<button onClick={handleDropdownToggle} data-cy="gear-button" title="">
				<FontAwesomeIcon icon="circle-user" />
			</button>
			<ul className="dropdown-menu dropdown-menu-right">
				<li>
					<a
						target="_blank"
						rel="noopener noreferrer"
						href="https://github.com/brmodeloweb/brmodelo-app/issues/new?template=requisitar-funcionalidade.md"
					>
						{t("Request feature")}
					</a>
				</li>
				<li>
					<a
						target="_blank"
						rel="noopener noreferrer"
						href="https://github.com/brmodeloweb/brmodelo-app/issues/new?template=reportar-problema.md"
					>
						{t("Report bug")}
					</a>
				</li>
				<li role="separator" className="divider"></li>
				{options.map((option, index) => (
					<li key={index} title="" onClick={(e) => handleMenuOptionSelected(e, option)}>
						<a>
							{option.name}
						</a>
					</li>
				))}
			</ul>
		</div>
	);
});

DropdownIcon.displayName = 'DropdownIcon';
