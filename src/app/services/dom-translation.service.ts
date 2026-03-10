import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class DomTranslationService {
  private readonly textOriginals = new WeakMap<Text, string>();
  private readonly attributeOriginals = new WeakMap<Element, Map<string, string>>();
  private observer?: MutationObserver;

  constructor(private translate: TranslateService) {}

  init(): void {
    if (typeof document === 'undefined' || this.observer) {
      return;
    }

    this.translate.onLangChange.subscribe(() => {
      this.translatePage();
    });

    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => this.processNode(node));
        if (mutation.type === 'characterData' && mutation.target.nodeType === Node.TEXT_NODE) {
          this.processTextNode(mutation.target as Text);
        }
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    this.translatePage();
  }

  translatePage(root: ParentNode = document.body): void {
    this.processNode(root);
  }

  private processNode(node: Node): void {
    if (node.nodeType === Node.TEXT_NODE) {
      this.processTextNode(node as Text);
      return;
    }

    if (
      node.nodeType !== Node.ELEMENT_NODE &&
      node.nodeType !== Node.DOCUMENT_NODE &&
      node.nodeType !== Node.DOCUMENT_FRAGMENT_NODE
    ) {
      return;
    }

    if (node instanceof Element) {
      if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.tagName)) {
        return;
      }

      this.processAttributes(node);
    }

    node.childNodes.forEach((child) => this.processNode(child));
  }

  private processTextNode(textNode: Text): void {
    const currentText = textNode.textContent ?? '';
    if (!currentText.trim()) {
      return;
    }

    const originalText = this.textOriginals.get(textNode) ?? currentText;
    this.textOriginals.set(textNode, originalText);

    const trimmedOriginal = originalText.trim();
    const translated = this.translate.instant(trimmedOriginal);

    if (!translated || translated === trimmedOriginal) {
      textNode.textContent = originalText;
      return;
    }

    textNode.textContent = originalText.replace(trimmedOriginal, translated);
  }

  private processAttributes(element: Element): void {
    for (const attribute of ['placeholder', 'title', 'aria-label']) {
      const currentValue = element.getAttribute(attribute);
      if (!currentValue || !currentValue.trim()) {
        continue;
      }

      let originalMap = this.attributeOriginals.get(element);
      if (!originalMap) {
        originalMap = new Map<string, string>();
        this.attributeOriginals.set(element, originalMap);
      }

      const originalValue = originalMap.get(attribute) ?? currentValue;
      originalMap.set(attribute, originalValue);

      const translated = this.translate.instant(originalValue);
      element.setAttribute(attribute, translated && translated !== originalValue ? translated : originalValue);
    }
  }
}
