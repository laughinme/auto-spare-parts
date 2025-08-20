package com.lapcevichme.templates.domain.model

/**
 * Generic pagination model for list responses
 *
 * @param T type of items in the page
 * @property items List of items in the current page
 * @property offset Starting position in the total list
 * @property limit Maximum number of items per page
 * @property total Total number of items available
 */
data class Page<T>(
    val items: List<T>,
    val offset: Int,
    val limit: Int,
    val total: Int
)
