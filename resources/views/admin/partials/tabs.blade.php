<div class="wizard-wrapper">
    <div id="wizard_verticle" class="form_wizard wizard_verticle">
        <h2>Translation fields </h2>
        <ul class="list-unstyled wizard_steps anchor">
            @foreach(config('constants.locals') as $local => $tail)
                <li>
                    <a href="#step-{{ $local }}">
                        <span class="step_no">{{ $local }}</span>
                    </a>
                </li>
            @endforeach
        </ul>
        @foreach(config('constants.locals') as $local => $tail)
            <div class="content" id="step-{{ $local }}">

                @if(isset($form_builder['form_path']))
                    @include($form_builder['form_path'], ['local' => $local, 'tail' => $tail])
                @endif
            </div>
        @endforeach
    </div>
</div>
<div class="clearfix"></div>
