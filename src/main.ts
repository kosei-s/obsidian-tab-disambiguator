import { Plugin } from "obsidian";
import { TabParentFolderLabelService } from "./tab-parent-folder-label";

export default class TabDisambiguatorPlugin extends Plugin {
	private tabParentFolderLabelService: TabParentFolderLabelService | null = null;

	async onload(): Promise<void> {
		this.tabParentFolderLabelService = new TabParentFolderLabelService(this);
		this.tabParentFolderLabelService.start();
	}

	onunload(): void {
		this.tabParentFolderLabelService?.stop();
		this.tabParentFolderLabelService = null;
	}
}
