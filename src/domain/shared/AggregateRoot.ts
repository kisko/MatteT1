import { DomainEvent } from './DomainEvent.js';

/**
 * Grunnklasse for Aggregate Roots i Domain-Driven Design.
 * Ansvarlig for å administrere tilstand, forretningsinvarianter og domenehendelser (Domain Events).
 */
export abstract class AggregateRoot<TId> {
  protected readonly _domainEvents: DomainEvent[] = [];

  public abstract get id(): TId;

  public get domainEvents(): ReadonlyArray<DomainEvent> {
    return Object.freeze([...this._domainEvents]);
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  public clearDomainEvents(): void {
    this._domainEvents.length = 0;
  }
}
