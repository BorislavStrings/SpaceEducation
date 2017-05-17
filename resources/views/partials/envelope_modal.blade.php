<div id="contact-popup">
  <i class="fa fa-times close-btn" aria-hidden="true"></i>
  <div class="title">{{ trans('app.contact_popup_title') }}</div>
  <form action="{{ route('send_mail') }}" id="contacts-form">
      {{ csrf_field() }}
      <title>{{ trans('contact_popup_title') }}</title>
      <div class="form-group">
        <label for="sender">{{ trans('app.contact_sender') }}</label>
        <input type="text" name="sender" id="sender" class="form-control">
      </div>
      <div class="form-group">
        <label for="subject">{{ trans('app.contact_subject') }}</label>
        <input type="text" name="subject" id="subject" class="form-control">
      </div>
      <div class="form-group">
        <label for="content">{{ trans('app.contact_content') }}</label>
        <textarea name="content" rows="5" id="content" class="form-control"></textarea>
      </div>
      <div class="errors"></div>
      <button type="submit" class="btn btn-primary pull-right">{{ trans('app.send') }}</button>
  </form>
</div>
<div id="contact-mask"></div>