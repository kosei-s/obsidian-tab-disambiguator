import { FileView, Plugin, TFile, WorkspaceLeaf } from "obsidian";

interface InternalWorkspaceLeaf extends WorkspaceLeaf {
	tabHeaderInnerEl?: HTMLElement | null;
	tabHeaderEl?: HTMLElement | null;
	tabHeaderInnerTitleEl?: HTMLElement | null;
}

const PARENT_FOLDER_LABEL_CLASS = "otd-tab-parent-folder";
const HAS_PARENT_FOLDER_LABEL_CLASS = "otd-tab-has-parent-folder-label";

export class TabParentFolderLabelService {
	private readonly labelByLeaf = new Map<WorkspaceLeaf, HTMLSpanElement>();
	private refreshRafId: number | null = null;
	private started = false;

	constructor(private readonly plugin: Plugin) {}

	start(): void {
		if (this.started) {
			return;
		}

		this.started = true;
		this.registerEvents();
		this.scheduleRefresh();
	}

	stop(): void {
		if (!this.started) {
			return;
		}

		this.started = false;
		if (this.refreshRafId !== null) {
			window.cancelAnimationFrame(this.refreshRafId);
			this.refreshRafId = null;
		}

		this.removeAllLabels();
	}

	private registerEvents(): void {
		const refresh = (): void => this.scheduleRefresh();

		this.plugin.registerEvent(this.plugin.app.workspace.on("layout-change", refresh));
		this.plugin.registerEvent(this.plugin.app.workspace.on("file-open", refresh));
		this.plugin.registerEvent(this.plugin.app.workspace.on("active-leaf-change", refresh));
		this.plugin.registerEvent(this.plugin.app.workspace.on("css-change", refresh));
		this.plugin.registerEvent(
			this.plugin.app.workspace.on("window-open", (_workspaceWindow, _window) => refresh()),
		);
		this.plugin.registerEvent(this.plugin.app.vault.on("rename", refresh));
		this.plugin.registerEvent(this.plugin.app.vault.on("create", refresh));
		this.plugin.registerEvent(this.plugin.app.vault.on("delete", refresh));
	}

	private scheduleRefresh(): void {
		if (!this.started || this.refreshRafId !== null) {
			return;
		}

		this.refreshRafId = window.requestAnimationFrame(() => {
			this.refreshRafId = null;
			this.refreshAllLeaves();
		});
	}

	private refreshAllLeaves(): void {
		const seenLeaves = new Set<WorkspaceLeaf>();
		this.plugin.app.workspace.iterateAllLeaves((leaf) => {
			seenLeaves.add(leaf);
			this.refreshLeaf(leaf);
		});

		for (const leaf of this.labelByLeaf.keys()) {
			if (!seenLeaves.has(leaf)) {
				this.removeLabel(leaf);
			}
		}
	}

	private refreshLeaf(leaf: WorkspaceLeaf): void {
		const targetFile = this.getTargetFile(leaf);
		if (targetFile === null) {
			this.removeLabel(leaf);
			return;
		}

		const parentFolderName = this.getParentFolderName(targetFile);
		if (parentFolderName === null) {
			this.removeLabel(leaf);
			return;
		}

		const tabHeaderInnerEl = this.getTabHeaderInnerEl(leaf);
		if (tabHeaderInnerEl === null) {
			this.removeLabel(leaf);
			return;
		}

		const titleEl = tabHeaderInnerEl.querySelector<HTMLElement>(".workspace-tab-header-inner-title");
		if (titleEl === null) {
			this.removeLabel(leaf);
			return;
		}

		const labelEl = this.getOrCreateLabelElement(leaf, tabHeaderInnerEl);
		if (labelEl.textContent !== parentFolderName) {
			labelEl.textContent = parentFolderName;
		}

		if (labelEl.parentElement !== tabHeaderInnerEl || labelEl.previousElementSibling !== titleEl) {
			tabHeaderInnerEl.insertBefore(labelEl, titleEl.nextSibling);
		}
		tabHeaderInnerEl.classList.add(HAS_PARENT_FOLDER_LABEL_CLASS);

		this.removeDuplicateLabels(tabHeaderInnerEl, labelEl);
	}

	private getTargetFile(leaf: WorkspaceLeaf): TFile | null {
		const { view } = leaf;
		if (!(view instanceof FileView) || view.file === null) {
			return null;
		}

		return view.file;
	}

	private getParentFolderName(file: TFile): string | null {
		const parent = file.parent;
		if (parent === null || parent.isRoot()) {
			return null;
		}

		return parent.name;
	}

	private getTabHeaderInnerEl(leaf: WorkspaceLeaf): HTMLElement | null {
		const internalLeaf = leaf as InternalWorkspaceLeaf;

		if (internalLeaf.tabHeaderInnerEl instanceof HTMLElement) {
			return internalLeaf.tabHeaderInnerEl;
		}

		if (internalLeaf.tabHeaderEl instanceof HTMLElement) {
			const fromTabHeader = internalLeaf.tabHeaderEl.querySelector<HTMLElement>(".workspace-tab-header-inner");
			if (fromTabHeader instanceof HTMLElement) {
				return fromTabHeader;
			}
		}

		if (internalLeaf.tabHeaderInnerTitleEl instanceof HTMLElement) {
			const fromTitle = internalLeaf.tabHeaderInnerTitleEl.closest(".workspace-tab-header-inner");
			if (fromTitle instanceof HTMLElement) {
				return fromTitle;
			}
		}

		return null;
	}

	private getOrCreateLabelElement(leaf: WorkspaceLeaf, tabHeaderInnerEl: HTMLElement): HTMLSpanElement {
		const cachedLabel = this.labelByLeaf.get(leaf);
		if (cachedLabel !== undefined) {
			cachedLabel.classList.add(PARENT_FOLDER_LABEL_CLASS);
			cachedLabel.setAttribute("aria-hidden", "true");
			return cachedLabel;
		}

		const existingLabel = tabHeaderInnerEl.querySelector<HTMLSpanElement>(
			`span.${PARENT_FOLDER_LABEL_CLASS}`,
		);
		if (existingLabel !== null) {
			existingLabel.classList.add(PARENT_FOLDER_LABEL_CLASS);
			existingLabel.setAttribute("aria-hidden", "true");
			this.labelByLeaf.set(leaf, existingLabel);
			return existingLabel;
		}

		const labelEl = tabHeaderInnerEl.ownerDocument.createElement("span");
		labelEl.className = PARENT_FOLDER_LABEL_CLASS;
		labelEl.setAttribute("aria-hidden", "true");
		this.labelByLeaf.set(leaf, labelEl);
		return labelEl;
	}

	private removeDuplicateLabels(tabHeaderInnerEl: HTMLElement, keepLabelEl: HTMLSpanElement): void {
		const labels = tabHeaderInnerEl.querySelectorAll<HTMLSpanElement>(`span.${PARENT_FOLDER_LABEL_CLASS}`);
		labels.forEach((label) => {
			if (label !== keepLabelEl) {
				label.remove();
			}
		});
	}

	private removeLabel(leaf: WorkspaceLeaf): void {
		const labelEl = this.labelByLeaf.get(leaf);
		if (labelEl !== undefined) {
			labelEl.remove();
			this.labelByLeaf.delete(leaf);
		}

		const tabHeaderInnerEl = this.getTabHeaderInnerEl(leaf);
		if (tabHeaderInnerEl === null) {
			return;
		}

		const strayLabels = tabHeaderInnerEl.querySelectorAll<HTMLElement>(`.${PARENT_FOLDER_LABEL_CLASS}`);
		strayLabels.forEach((strayLabel) => {
			strayLabel.remove();
		});
		tabHeaderInnerEl.classList.remove(HAS_PARENT_FOLDER_LABEL_CLASS);
	}

	private removeAllLabels(): void {
		for (const labelEl of this.labelByLeaf.values()) {
			labelEl.remove();
		}
		this.labelByLeaf.clear();

		this.plugin.app.workspace.iterateAllLeaves((leaf) => {
			const tabHeaderInnerEl = this.getTabHeaderInnerEl(leaf);
			if (tabHeaderInnerEl === null) {
				return;
			}

			const labels = tabHeaderInnerEl.querySelectorAll<HTMLElement>(`.${PARENT_FOLDER_LABEL_CLASS}`);
			labels.forEach((label) => {
				label.remove();
			});
			tabHeaderInnerEl.classList.remove(HAS_PARENT_FOLDER_LABEL_CLASS);
		});
	}
}
