package graph

import (
	"errors"
	"fmt"
	"net/http"
)

type APIError struct {
	StatusCode int
	Code       string
	Message    string
}

func (e *APIError) Error() string {
	if e.Code != "" {
		return fmt.Sprintf("anyshift graph api: %d (%s): %s", e.StatusCode, e.Code, e.Message)
	}
	return fmt.Sprintf("anyshift graph api: %d: %s", e.StatusCode, e.Message)
}

func IsAuthError(err error) bool {
	var apiErr *APIError
	return errors.As(err, &apiErr) && apiErr.StatusCode == http.StatusUnauthorized
}

func IsBadRequest(err error) bool {
	var apiErr *APIError
	return errors.As(err, &apiErr) && apiErr.StatusCode == http.StatusBadRequest
}
