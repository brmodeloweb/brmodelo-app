import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useTranslation } from "react-i18next";
import { ConceptualIcon, LogicIcon, NoSqlIcon } from "../../components/Icons";
import { DropdownOption } from "../../components/DropdownIcon";
import Feedback from "../../components/Feedback";
import { Model } from "../../services/types/model";
import loadingDots from "../../../img/loading-dots.gif";

interface WorkspacePageProps {
	models: Model[];
	loading: boolean;
	feedback: {
		message: string;
		showing: boolean;
		type: "success" | "error" | "warning";
	};
	onCloseFeedback: () => void;
	dropdownOptions: DropdownOption[];
	onOpenModel: (model: Model) => void;
	onNewModel: () => void;
	onRenameModel: (model: Model) => void;
	onDeleteModel: (model: Model) => void;
	onMenuOptionSelected: (option: DropdownOption) => void;
	DropdownIconComponent: React.ComponentType<any>;
}

const WorkspacePage: React.FC<WorkspacePageProps> = React.memo(({
	models,
	loading,
	feedback,
	onCloseFeedback,
	dropdownOptions,
	onOpenModel,
	onNewModel,
	onRenameModel,
	onDeleteModel,
	onMenuOptionSelected,
	DropdownIconComponent,
}) => {
	const { t } = useTranslation(["common"]);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const day = String(date.getDate()).padStart(2, '0');
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const year = date.getFullYear();
		return `${day}/${month}/${year}`;
	};

	return (
		<section className="view modelsList">
			<header className="navbar navbar-default navbar-fixed-top">
				<div className="container">
					<div className="navbar-header pull-left">
						<strong className="navbar-brand">BRMODELO</strong>
					</div>
					<div className="nav navbar-nav pull-right nav-icons">
						<DropdownIconComponent
							options={dropdownOptions}
							onSelect={onMenuOptionSelected}
						/>
					</div>
					<img
						src={loadingDots}
						alt="Loading"
						className={`br-loader fixed ${loading ? 'loading' : ''}`}
					/>
				</div>
			</header>

			<section className="mainContent">
				<header className="container">
					<Feedback
						message={feedback.message}
						showing={feedback.showing}
						type={feedback.type}
						onClose={onCloseFeedback}
					/>

					<div className="page-header clearfix">
						<h2 className="h2 pull-left">{t('Models')}</h2>
						<aside className="header-actions pull-right">
							<a className="br-button" onClick={onNewModel}>
								<FontAwesomeIcon icon="circle-plus" /> {t('New model')}
							</a>
						</aside>
					</div>
				</header>

				<div className="container projectsList">
					<div className="table-responsive">
						<table className="table table-hover">
							<thead>
								<tr>
									<th><strong>{t('Type')}</strong></th>
									<th><strong>{t('Name')}</strong></th>
									<th><strong>{t('Created')}</strong></th>
									<th colSpan={1}><strong className="vhide actions-cell">{t('Actions')}</strong></th>
								</tr>
							</thead>
							<tbody>
								{models.map((model) => (
									<tr key={model._id} className="listLine">
										<td onClick={() => onOpenModel(model)}>
											{model.type === 'conceptual' && (
												<ConceptualIcon className="modelType" />
											)}
											{model.type === 'logic' && (
												<LogicIcon className="modelType" />
											)}
											{model.type === 'nosql' && (
												<NoSqlIcon className="modelType" />
											)}
											<span>{
												model.type === 'conceptual' ? t('Conceptual') :
												model.type === 'logic' ? t('Logical') :
												model.type === 'nosql' ? t('NoSQL') :
												model.type
											}</span>
										</td>
										<td onClick={() => onOpenModel(model)}>
											<span>{model.name}</span>
										</td>
										<td onClick={() => onOpenModel(model)}>{formatDate(model.created)}</td>
										<td className="actions-cell">
											<FontAwesomeIcon
												title={t('Rename')}
												icon="pencil"
												onClick={() => onRenameModel(model)}
											/>
											<FontAwesomeIcon
												title={t('Delete')}
												icon="trash"
												onClick={() => onDeleteModel(model)}
											/>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</section>
		</section>
	);
});

WorkspacePage.displayName = 'WorkspacePage';
export default WorkspacePage;
