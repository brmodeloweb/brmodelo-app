import React, { useRef } from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import styled from "styled-components";

const StyledOverlay = styled(RadixDialog.Overlay)`
	position: fixed;
	inset: 0;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 1050;
`;

const StyledContent = styled(RadixDialog.Content)`
	position: fixed;
	top: 15vh;
	left: 50%;
	transform: translateX(-50%);
	width: 600px;
	max-width: calc(100vw - 32px);
	max-height: calc(100vh - 17vh - 16px);
	overflow: auto;
	z-index: 1051;
	outline: none;

	&:focus {
		outline: none;
	}

	.modal-content {
		position: relative;
	}

	.modal-footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 6px;
	}

	.br-loader-divider {
		position: absolute;
		top: 56px;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 2;
	}
`;

interface DialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	closeOnOverlayClick?: boolean;
	closeOnEscape?: boolean;
	children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({
	open,
	onOpenChange,
	title,
	closeOnOverlayClick = true,
	closeOnEscape = true,
	children,
}) => {
	const contentRef = useRef<HTMLDivElement>(null);

	return (
		<RadixDialog.Root open={open} onOpenChange={onOpenChange}>
			<RadixDialog.Portal>
				<StyledOverlay />
				<StyledContent
					ref={contentRef}
					onPointerDownOutside={(event) => {
						if (!closeOnOverlayClick) event.preventDefault();
					}}
					onEscapeKeyDown={(event) => {
						if (!closeOnEscape) event.preventDefault();
					}}
					onOpenAutoFocus={(event) => {
						event.preventDefault();
						contentRef.current?.focus();
					}}
					aria-describedby={undefined}
				>
					<div className="modal-content">
						<RadixDialog.Title asChild>
							<div className="modal-header">
								<h3 className="modal-title">{title}</h3>
							</div>
						</RadixDialog.Title>
						{children}
					</div>
				</StyledContent>
			</RadixDialog.Portal>
		</RadixDialog.Root>
	);
};

export default Dialog;
