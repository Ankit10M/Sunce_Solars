export const VALID_TRANSITIONS = {
    ticket_created: ['pickup_scheduled'],
    pickup_scheduled: ['on_transit', 'ticket_created'],  // allow rollback if pickup cancelled
    on_transit: ['received'],
    received: ['under_diagnosis'],
    under_diagnosis: ['under_repair', 'closed'],        // 'closed' = non-repairable decision
    under_repair: ['ready_to_dispatch'],
    ready_to_dispatch: ['dispatched'],
    dispatched: ['delivered'],
    delivered: ['closed'],
    closed: [],
}
export const isValidTransition = (fromStatus, toStatus) => {
    const allowed = VALID_TRANSITIONS[fromStatus]
    if (!allowed) return false;
    return allowed.includes(toStatus)
}

export const getNextStatuses = (currentStatus) => {
    return VALID_TRANSITIONS[currentStatus] || []
};