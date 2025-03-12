import { LitElement, PropertyValues, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

@customElement("drag-drop-box")
export class DragDropBox extends LitElement {
  static styles = css`
    :host {
      box-sizing: border-box;
      margin: 0;
    }
    .container {
      display: flex;
      flex-wrap: wrap;
      height: 100%;
      width: 100%;
    }
  `;

  @query("slot")
  private slotElement?: HTMLSlotElement;

  @state()
  private draggedElement: Element | null = null;

  @property({ type: String })
  direction: "vertical" | "horizontal" = "vertical";

  @property({ type: String })
  spacing: string = "4px";

  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);

    this.initDraggleableItems();

    this.slotElement?.addEventListener("slotchange", () =>
      this.initDraggleableItems()
    );
  }

  private initDraggleableItems() {
    const items = this.slotElement?.assignedElements({ flatten: true });

    items?.map((item) => {
      item.removeEventListener(
        "dragstart",
        this.handleOnDragStart as EventListener
      );
      item.removeEventListener(
        "dragover",
        this.handleOnDragOver as EventListener
      );
      item.removeEventListener(
        "drop",
        this.handleOnDrop as EventListenerOrEventListenerObject
      );
      item.removeEventListener(
        "dragend",
        this.handleOnDragEnd as EventListenerOrEventListenerObject
      );

      item.addEventListener(
        "dragstart",
        this.handleOnDragStart as EventListenerOrEventListenerObject
      );
      item.addEventListener(
        "dragover",
        this.handleOnDragOver as EventListenerOrEventListenerObject
      );
      item.addEventListener(
        "drop",
        this.handleOnDrop as EventListenerOrEventListenerObject
      );
      item.addEventListener(
        "dragend",
        this.handleOnDragEnd as EventListenerOrEventListenerObject
      );
    });
  }

  private handleOnDragStart = (e: DragEvent) => {
    const target = e.currentTarget as Element;
    this.draggedElement = target;
    e.dataTransfer?.setData("text/plain", "");
    if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
  };

  private handleOnDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
  };

  private handleOnDrop = (event: DragEvent) => {
    event.preventDefault();
    const target = event.currentTarget as Element;

    if (!this.draggedElement || this.draggedElement === target) return;

    const container = target.parentElement;

    if (!container) return;

    const elements = Array.from(container.children);

    const targetIndex = elements.indexOf(target);

    const draggedIndex = elements.indexOf(this.draggedElement);

    draggedIndex < targetIndex
      ? container.insertBefore(this.draggedElement, target.nextSibling)
      : container.insertBefore(this.draggedElement, target);
  };

  private handleOnDragEnd = () => {
    this.draggedElement = null;
  };

  render() {
    return html`
      <style>
        .container {
          gap: ${this.spacing};
          flex-direction: ${this.direction === "vertical" ? "column" : "row"};
        }
      </style>
      <div class="container">
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "drag-drop-list": DragDropBox;
  }
}
