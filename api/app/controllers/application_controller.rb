class ApplicationController < ActionController::API
  rescue_from ActionController::ParameterMissing, with: :handle_parameter_missing
  rescue_from ActiveRecord::RecordNotFound, with: :handle_record_not_found

  private

  def handle_parameter_missing(exception)
    render json: {
      error: 'Parameter missing',
      message: exception.message
    }, status: :bad_request
  end

  def handle_record_not_found(exception)
    render json: {
      error: 'Record not found',
      message: exception.message
    }, status: :not_found
  end
end
