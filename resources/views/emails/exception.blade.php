<!DOCTYPE html>
<html>
	<head>
	<meta charset="UTF-8">
	<title>Spaceport Exception</title>
	</head>

	<body>
		@if(isset($error_report) && $error_report)
			<p>Error Code: {{ $error_code }}</p>
			<p>Error Path: {{ $error_path }}</p>
			<p>Error Message: {{ $error_message }}</p>
			<p>Error File: {{ $error_file }}</p>
			<p>Error Line: {{ $error_line }}</p>
			<p>Error Trace:</p>
			<p>{{ $error_trace }}</p>
		@else
			Fatal Error
		@endif
	</body>
</html> 