2026-01-20T19:32:55.792915854Z [err]      common_field = self._common_field_schema(name, field_info, decorators)
2026-01-20T19:32:55.792921906Z [err]                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:32:55.792927510Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 951, in _common_field_schema
2026-01-20T19:32:55.792933388Z [err]      schema = self._apply_annotations(
2026-01-20T19:32:55.792939282Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:32:55.792945478Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 1654, in _apply_annotations
2026-01-20T19:32:55.792998306Z [err]      schema = get_inner_schema(source_type)
2026-01-20T19:32:55.793003746Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:32:55.793014159Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_schema_generation_shared.py", line 82, in __call__
2026-01-20T19:32:55.793019999Z [err]      schema = self._handler(__source_type)
2026-01-20T19:32:55.793026135Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:32:55.796138579Z [err]      schema = get_schema(
2026-01-20T19:32:55.796144795Z [err]               ^^^^^^^^^^^
2026-01-20T19:32:55.796149131Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/networks.py", line 390, in __get_pydantic_core_schema__
2026-01-20T19:32:55.796153288Z [err]      import_email_validator()
2026-01-20T19:32:55.796163649Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/networks.py", line 354, in import_email_validator
2026-01-20T19:32:55.796168852Z [err]  ModuleNotFoundError: No module named 'email_validator'
2026-01-20T19:32:55.796180335Z [err]  
2026-01-20T19:32:55.796188830Z [err]  The above exception was the direct cause of the following exception:
2026-01-20T19:32:55.796196325Z [err]      raise ImportError('email-validator is not installed, run `pip install pydantic[email]`') from e
2026-01-20T19:32:55.796207509Z [err]  ImportError: email-validator is not installed, run `pip install pydantic[email]`
2026-01-20T19:32:55.796214451Z [err]  
2026-01-20T19:32:55.796218701Z [inf]  Starting uvicorn on port 8080...
2026-01-20T19:32:55.796228556Z [err]  Traceback (most recent call last):
2026-01-20T19:32:55.796231347Z [err]  Traceback (most recent call last):
2026-01-20T19:32:55.796239894Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/networks.py", line 352, in import_email_validator
2026-01-20T19:32:55.796245446Z [err]      import email_validator
2026-01-20T19:32:55.796308073Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 1633, in inner_handler
2026-01-20T19:32:55.796320855Z [err]      from_property = self._generate_schema_from_property(obj, obj)
2026-01-20T19:32:55.796333399Z [err]                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:32:55.796346160Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 616, in _generate_schema_from_property
2026-01-20T19:32:55.801034327Z [err]    File "/usr/local/bin/uvicorn", line 8, in <module>
2026-01-20T19:32:55.801040051Z [err]      sys.exit(main())
2026-01-20T19:32:55.801045838Z [err]               ^^^^^^
2026-01-20T19:32:55.801051661Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 1485, in __call__
2026-01-20T19:32:55.801057873Z [err]      return self.main(*args, **kwargs)
2026-01-20T19:32:55.801063963Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:32:55.801070013Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 1406, in main
2026-01-20T19:32:55.801075784Z [err]      rv = self.invoke(ctx)
2026-01-20T19:32:55.801082910Z [err]           ^^^^^^^^^^^^^^^^
2026-01-20T19:32:55.801088410Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 1269, in invoke
2026-01-20T19:32:55.801149981Z [err]      return ctx.invoke(self.callback, **ctx.params)
2026-01-20T19:32:55.801155432Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:32:55.801160103Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 824, in invoke
2026-01-20T19:32:55.801164257Z [err]      return callback(*args, **kwargs)
2026-01-20T19:32:55.801168641Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:32:55.801172809Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/main.py", line 418, in main
2026-01-20T19:32:55.801176353Z [err]      run(
2026-01-20T19:32:55.801182774Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/main.py", line 587, in run
2026-01-20T19:32:55.801186867Z [err]      server.run()
2026-01-20T19:32:55.801190971Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/server.py", line 62, in run
2026-01-20T19:32:55.801194853Z [err]      return asyncio.run(self.serve(sockets=sockets))
2026-01-20T19:32:55.801198610Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:32:55.804597654Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:32:55.804611981Z [err]    File "<frozen importlib._bootstrap>", line 1204, in _gcd_import
2026-01-20T19:32:55.804621037Z [err]    File "<frozen importlib._bootstrap>", line 1176, in _find_and_load
2026-01-20T19:32:55.804782033Z [err]    File "/usr/local/lib/python3.11/asyncio/runners.py", line 190, in run
2026-01-20T19:32:55.804789646Z [err]      return runner.run(main)
2026-01-20T19:32:55.804796617Z [err]             ^^^^^^^^^^^^^^^^
2026-01-20T19:32:55.804815077Z [err]    File "/usr/local/lib/python3.11/asyncio/runners.py", line 118, in run
2026-01-20T19:32:55.804822936Z [err]      return self._loop.run_until_complete(task)
2026-01-20T19:32:55.804829734Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:32:55.804836636Z [err]    File "uvloop/loop.pyx", line 1518, in uvloop.loop.Loop.run_until_complete
2026-01-20T19:32:55.804845559Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/server.py", line 69, in serve
2026-01-20T19:32:55.804853810Z [err]      config.load()
2026-01-20T19:32:55.804860940Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/config.py", line 458, in load
2026-01-20T19:32:55.804867410Z [err]      self.loaded_app = import_from_string(self.app)
2026-01-20T19:32:55.804876209Z [err]                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:32:55.804883290Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/importer.py", line 21, in import_from_string
2026-01-20T19:32:55.804889251Z [err]      module = importlib.import_module(module_str)
2026-01-20T19:32:55.804895205Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:32:55.804900967Z [err]    File "/usr/local/lib/python3.11/importlib/__init__.py", line 126, in import_module
2026-01-20T19:32:55.804911721Z [err]      return _bootstrap._gcd_import(name[level:], package, level)
2026-01-20T19:32:55.807921149Z [err]    File "<frozen importlib._bootstrap>", line 1147, in _find_and_load_unlocked
2026-01-20T19:32:55.808487243Z [err]    File "<frozen importlib._bootstrap>", line 690, in _load_unlocked
2026-01-20T19:32:55.808493039Z [err]    File "<frozen importlib._bootstrap_external>", line 940, in exec_module
2026-01-20T19:32:55.808498014Z [err]    File "<frozen importlib._bootstrap>", line 241, in _call_with_frames_removed
2026-01-20T19:32:55.808502897Z [err]    File "/app/app.py", line 45, in <module>
2026-01-20T19:32:55.808507718Z [err]      from routes import auth, pantry, recipes, meal_plans, shopping_list, alerts
2026-01-20T19:32:55.808512898Z [err]    File "/app/routes/__init__.py", line 5, in <module>
2026-01-20T19:32:55.808518251Z [err]      from . import auth, pantry, recipes, meal_plans, shopping_list, alerts
2026-01-20T19:32:55.808524284Z [err]    File "/app/routes/auth.py", line 14, in <module>
2026-01-20T19:32:55.808529602Z [err]      class SignUpRequest(BaseModel):
2026-01-20T19:32:55.808534889Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_model_construction.py", line 182, in __new__
2026-01-20T19:32:55.808539650Z [err]      complete_model_class(
2026-01-20T19:32:55.808544375Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_model_construction.py", line 491, in complete_model_class
2026-01-20T19:32:55.808549246Z [err]      schema = cls.__get_pydantic_core_schema__(cls, handler)
2026-01-20T19:32:55.808554402Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:32:55.808559868Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/main.py", line 578, in __get_pydantic_core_schema__
2026-01-20T19:32:55.808564642Z [err]      return __handler(__source)
2026-01-20T19:32:55.808569853Z [err]             ^^^^^^^^^^^^^^^^^^^
2026-01-20T19:32:55.808575220Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_schema_generation_shared.py", line 82, in __call__
2026-01-20T19:32:55.812621300Z [err]      schema = self._handler(__source_type)
2026-01-20T19:32:55.812626263Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:32:55.812631268Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 468, in generate_schema
2026-01-20T19:32:55.812636272Z [err]      schema = self._generate_schema(obj)
2026-01-20T19:32:55.812641730Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:32:55.812648101Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 700, in _generate_schema
2026-01-20T19:32:55.812654387Z [err]      schema = self._post_process_generated_schema(self._generate_schema_inner(obj))
2026-01-20T19:32:55.812659707Z [err]                                                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:32:55.812664899Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 722, in _generate_schema_inner
2026-01-20T19:32:55.812670048Z [err]      return self._model_schema(obj)
2026-01-20T19:32:55.812675819Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:32:55.812681043Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 541, in _model_schema
2026-01-20T19:32:55.812686936Z [err]      {k: self._generate_md_field_schema(k, v, decorators) for k, v in fields.items()},
2026-01-20T19:32:55.812692342Z [err]      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:32:55.812697449Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 541, in <dictcomp>
2026-01-20T19:32:55.812702294Z [err]      {k: self._generate_md_field_schema(k, v, decorators) for k, v in fields.items()},
2026-01-20T19:32:55.812708090Z [err]          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:32:55.816834021Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 886, in _generate_md_field_schema
2026-01-20T19:32:55.816842895Z [err]      common_field = self._common_field_schema(name, field_info, decorators)
2026-01-20T19:32:55.816851208Z [err]                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:32:55.816925834Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 951, in _common_field_schema
2026-01-20T19:32:55.816933753Z [err]      schema = self._apply_annotations(
2026-01-20T19:32:55.816940748Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:32:55.816964454Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 1654, in _apply_annotations
2026-01-20T19:32:55.816971091Z [err]      schema = get_inner_schema(source_type)
2026-01-20T19:32:55.818252994Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:32:55.818263384Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_schema_generation_shared.py", line 82, in __call__
2026-01-20T19:32:55.819109383Z [err]      schema = self._handler(__source_type)
2026-01-20T19:32:55.819132598Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:32:55.819141402Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 1633, in inner_handler
2026-01-20T19:32:55.819149110Z [err]      from_property = self._generate_schema_from_property(obj, obj)
2026-01-20T19:32:55.819163534Z [err]                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:32:55.819172421Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 616, in _generate_schema_from_property
2026-01-20T19:32:55.819181277Z [err]      schema = get_schema(
2026-01-20T19:32:55.819189238Z [err]               ^^^^^^^^^^^
2026-01-20T19:32:55.820373858Z [err]      import_email_validator()
2026-01-20T19:32:55.820416830Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/networks.py", line 354, in import_email_validator
2026-01-20T19:32:55.820426839Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/networks.py", line 390, in __get_pydantic_core_schema__
2026-01-20T19:32:55.820443526Z [err]      raise ImportError('email-validator is not installed, run `pip install pydantic[email]`') from e
2026-01-20T19:32:55.820451490Z [err]  ImportError: email-validator is not installed, run `pip install pydantic[email]`
2026-01-20T19:32:58.180760154Z [inf]  Starting uvicorn on port 8080...
2026-01-20T19:32:59.654453839Z [err]  Traceback (most recent call last):
2026-01-20T19:32:59.654464898Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/networks.py", line 352, in import_email_validator
2026-01-20T19:32:59.654474464Z [err]      import email_validator
2026-01-20T19:32:59.654483608Z [err]  ModuleNotFoundError: No module named 'email_validator'
2026-01-20T19:32:59.654494685Z [err]  
2026-01-20T19:32:59.654504870Z [err]  The above exception was the direct cause of the following exception:
2026-01-20T19:32:59.654514194Z [err]  
2026-01-20T19:32:59.654524015Z [err]  Traceback (most recent call last):
2026-01-20T19:32:59.654533604Z [err]    File "/usr/local/bin/uvicorn", line 8, in <module>
2026-01-20T19:32:59.654543314Z [err]      sys.exit(main())
2026-01-20T19:32:59.654553212Z [err]               ^^^^^^
2026-01-20T19:32:59.654563684Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 1485, in __call__
2026-01-20T19:32:59.654574506Z [err]      return self.main(*args, **kwargs)
2026-01-20T19:32:59.654583342Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:32:59.654592365Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 1406, in main
2026-01-20T19:32:59.654601309Z [err]      rv = self.invoke(ctx)
2026-01-20T19:32:59.654610738Z [err]           ^^^^^^^^^^^^^^^^
2026-01-20T19:32:59.654620537Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 1269, in invoke
2026-01-20T19:32:59.654629864Z [err]      return ctx.invoke(self.callback, **ctx.params)
2026-01-20T19:32:59.654639074Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:32:59.654649898Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 824, in invoke
2026-01-20T19:32:59.654659280Z [err]      return callback(*args, **kwargs)
2026-01-20T19:32:59.654669223Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:01.058140184Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/main.py", line 418, in main
2026-01-20T19:33:01.058147414Z [err]      run(
2026-01-20T19:33:01.058152953Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/main.py", line 587, in run
2026-01-20T19:33:01.058159197Z [err]      server.run()
2026-01-20T19:33:01.058164718Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/server.py", line 62, in run
2026-01-20T19:33:01.058171455Z [err]      return asyncio.run(self.serve(sockets=sockets))
2026-01-20T19:33:01.058177701Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:01.058183347Z [err]    File "/usr/local/lib/python3.11/asyncio/runners.py", line 190, in run
2026-01-20T19:33:01.058189543Z [err]      return runner.run(main)
2026-01-20T19:33:01.058194793Z [err]             ^^^^^^^^^^^^^^^^
2026-01-20T19:33:01.058201400Z [err]    File "/usr/local/lib/python3.11/asyncio/runners.py", line 118, in run
2026-01-20T19:33:01.058206782Z [err]      return self._loop.run_until_complete(task)
2026-01-20T19:33:01.058214222Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:01.058219810Z [err]    File "uvloop/loop.pyx", line 1518, in uvloop.loop.Loop.run_until_complete
2026-01-20T19:33:01.058226060Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/server.py", line 69, in serve
2026-01-20T19:33:01.058232292Z [err]      config.load()
2026-01-20T19:33:01.058238341Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/config.py", line 458, in load
2026-01-20T19:33:01.058244204Z [err]      self.loaded_app = import_from_string(self.app)
2026-01-20T19:33:01.058250210Z [err]                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:01.058256404Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/importer.py", line 21, in import_from_string
2026-01-20T19:33:01.058261936Z [err]      module = importlib.import_module(module_str)
2026-01-20T19:33:02.122528050Z [err]    File "<frozen importlib._bootstrap>", line 1147, in _find_and_load_unlocked
2026-01-20T19:33:02.122546530Z [err]    File "<frozen importlib._bootstrap>", line 690, in _load_unlocked
2026-01-20T19:33:02.122554635Z [err]    File "<frozen importlib._bootstrap_external>", line 940, in exec_module
2026-01-20T19:33:02.122562331Z [err]    File "<frozen importlib._bootstrap>", line 241, in _call_with_frames_removed
2026-01-20T19:33:02.122573464Z [err]    File "/app/app.py", line 45, in <module>
2026-01-20T19:33:02.122582081Z [err]      from routes import auth, pantry, recipes, meal_plans, shopping_list, alerts
2026-01-20T19:33:02.122591336Z [err]    File "/app/routes/__init__.py", line 5, in <module>
2026-01-20T19:33:02.122598825Z [err]      from . import auth, pantry, recipes, meal_plans, shopping_list, alerts
2026-01-20T19:33:02.122606675Z [err]    File "/app/routes/auth.py", line 14, in <module>
2026-01-20T19:33:02.122614878Z [err]      class SignUpRequest(BaseModel):
2026-01-20T19:33:02.122623078Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_model_construction.py", line 182, in __new__
2026-01-20T19:33:02.122631615Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:02.122632041Z [err]      complete_model_class(
2026-01-20T19:33:02.122641261Z [err]    File "/usr/local/lib/python3.11/importlib/__init__.py", line 126, in import_module
2026-01-20T19:33:02.122643101Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_model_construction.py", line 491, in complete_model_class
2026-01-20T19:33:02.122649201Z [err]      return _bootstrap._gcd_import(name[level:], package, level)
2026-01-20T19:33:02.122655559Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:02.122661960Z [err]    File "<frozen importlib._bootstrap>", line 1204, in _gcd_import
2026-01-20T19:33:02.122668638Z [err]    File "<frozen importlib._bootstrap>", line 1176, in _find_and_load
2026-01-20T19:33:03.191611281Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 541, in _model_schema
2026-01-20T19:33:03.191621324Z [err]      return __handler(__source)
2026-01-20T19:33:03.191628979Z [err]      return self._model_schema(obj)
2026-01-20T19:33:03.191632254Z [err]             ^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:03.191640656Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:03.191644812Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_schema_generation_shared.py", line 82, in __call__
2026-01-20T19:33:03.191645845Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:03.191657542Z [err]      schema = self._handler(__source_type)
2026-01-20T19:33:03.191657661Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 468, in generate_schema
2026-01-20T19:33:03.191657736Z [err]      schema = self._post_process_generated_schema(self._generate_schema_inner(obj))
2026-01-20T19:33:03.191659557Z [err]      schema = self._generate_schema(obj)
2026-01-20T19:33:03.191669755Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:03.191675242Z [err]                                                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:03.191680140Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 700, in _generate_schema
2026-01-20T19:33:03.191685613Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 722, in _generate_schema_inner
2026-01-20T19:33:03.191784824Z [err]      schema = cls.__get_pydantic_core_schema__(cls, handler)
2026-01-20T19:33:03.191792559Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:03.191801916Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/main.py", line 578, in __get_pydantic_core_schema__
2026-01-20T19:33:04.400160436Z [err]      {k: self._generate_md_field_schema(k, v, decorators) for k, v in fields.items()},
2026-01-20T19:33:04.400168248Z [err]      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:04.400199302Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 541, in <dictcomp>
2026-01-20T19:33:04.405502542Z [err]      {k: self._generate_md_field_schema(k, v, decorators) for k, v in fields.items()},
2026-01-20T19:33:04.405515458Z [err]          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:04.405522279Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 886, in _generate_md_field_schema
2026-01-20T19:33:04.405528140Z [err]      common_field = self._common_field_schema(name, field_info, decorators)
2026-01-20T19:33:04.405536310Z [err]                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:04.405542375Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 951, in _common_field_schema
2026-01-20T19:33:04.405550924Z [err]      schema = self._apply_annotations(
2026-01-20T19:33:04.405557148Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:04.405562630Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 1654, in _apply_annotations
2026-01-20T19:33:04.405568546Z [err]      schema = get_inner_schema(source_type)
2026-01-20T19:33:04.405573885Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:04.405580833Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_schema_generation_shared.py", line 82, in __call__
2026-01-20T19:33:04.405586727Z [err]      schema = self._handler(__source_type)
2026-01-20T19:33:04.405592397Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:05.436931192Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 1633, in inner_handler
2026-01-20T19:33:05.436938212Z [err]      from_property = self._generate_schema_from_property(obj, obj)
2026-01-20T19:33:05.436949074Z [err]                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:05.436955012Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 616, in _generate_schema_from_property
2026-01-20T19:33:05.436960264Z [err]      schema = get_schema(
2026-01-20T19:33:05.436965937Z [err]               ^^^^^^^^^^^
2026-01-20T19:33:05.436971491Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/networks.py", line 390, in __get_pydantic_core_schema__
2026-01-20T19:33:05.436976439Z [err]      import_email_validator()
2026-01-20T19:33:05.436982319Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/networks.py", line 354, in import_email_validator
2026-01-20T19:33:05.436987629Z [err]      raise ImportError('email-validator is not installed, run `pip install pydantic[email]`') from e
2026-01-20T19:33:05.436992878Z [err]  ImportError: email-validator is not installed, run `pip install pydantic[email]`
2026-01-20T19:33:05.436998966Z [inf]  Starting uvicorn on port 8080...
2026-01-20T19:33:05.437003491Z [err]  Traceback (most recent call last):
2026-01-20T19:33:05.437008202Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/networks.py", line 352, in import_email_validator
2026-01-20T19:33:05.437013346Z [err]      import email_validator
2026-01-20T19:33:05.437019442Z [err]  ModuleNotFoundError: No module named 'email_validator'
2026-01-20T19:33:05.437025755Z [err]  
2026-01-20T19:33:05.437032077Z [err]  The above exception was the direct cause of the following exception:
2026-01-20T19:33:05.437038265Z [err]  
2026-01-20T19:33:05.437043590Z [err]  Traceback (most recent call last):
2026-01-20T19:33:06.422476877Z [err]    File "/usr/local/bin/uvicorn", line 8, in <module>
2026-01-20T19:33:06.422483053Z [err]      sys.exit(main())
2026-01-20T19:33:06.422489600Z [err]               ^^^^^^
2026-01-20T19:33:06.422495397Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 1485, in __call__
2026-01-20T19:33:06.422500521Z [err]      return self.main(*args, **kwargs)
2026-01-20T19:33:06.422506047Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:06.422511510Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 1406, in main
2026-01-20T19:33:06.422516731Z [err]      rv = self.invoke(ctx)
2026-01-20T19:33:06.422523336Z [err]           ^^^^^^^^^^^^^^^^
2026-01-20T19:33:06.422529137Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 1269, in invoke
2026-01-20T19:33:06.425898036Z [err]      return ctx.invoke(self.callback, **ctx.params)
2026-01-20T19:33:06.425907909Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:06.425913823Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 824, in invoke
2026-01-20T19:33:06.425940680Z [err]      return callback(*args, **kwargs)
2026-01-20T19:33:06.425958751Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:06.425965016Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/main.py", line 418, in main
2026-01-20T19:33:06.425972610Z [err]      run(
2026-01-20T19:33:06.425980362Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/main.py", line 587, in run
2026-01-20T19:33:06.425985721Z [err]      server.run()
2026-01-20T19:33:06.425991080Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/server.py", line 62, in run
2026-01-20T19:33:06.425996184Z [err]      return asyncio.run(self.serve(sockets=sockets))
2026-01-20T19:33:06.426014990Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:06.428071812Z [err]      return runner.run(main)
2026-01-20T19:33:06.428082619Z [err]             ^^^^^^^^^^^^^^^^
2026-01-20T19:33:06.428091563Z [err]    File "/usr/local/lib/python3.11/asyncio/runners.py", line 190, in run
2026-01-20T19:33:06.428092673Z [err]    File "/usr/local/lib/python3.11/asyncio/runners.py", line 118, in run
2026-01-20T19:33:06.428099114Z [err]    File "<frozen importlib._bootstrap>", line 1176, in _find_and_load
2026-01-20T19:33:06.428100828Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/importer.py", line 21, in import_from_string
2026-01-20T19:33:06.428103815Z [err]      return self._loop.run_until_complete(task)
2026-01-20T19:33:06.428114549Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:06.428116315Z [err]      module = importlib.import_module(module_str)
2026-01-20T19:33:06.428122987Z [err]    File "uvloop/loop.pyx", line 1518, in uvloop.loop.Loop.run_until_complete
2026-01-20T19:33:06.428128535Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:06.428131249Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/server.py", line 69, in serve
2026-01-20T19:33:06.428138284Z [err]      config.load()
2026-01-20T19:33:06.428138829Z [err]    File "/usr/local/lib/python3.11/importlib/__init__.py", line 126, in import_module
2026-01-20T19:33:06.428145225Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/config.py", line 458, in load
2026-01-20T19:33:06.428148879Z [err]      return _bootstrap._gcd_import(name[level:], package, level)
2026-01-20T19:33:06.428155389Z [err]      self.loaded_app = import_from_string(self.app)
2026-01-20T19:33:06.428159370Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:06.428164190Z [err]                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:06.428169371Z [err]    File "<frozen importlib._bootstrap>", line 1204, in _gcd_import
2026-01-20T19:33:06.429214846Z [err]      from routes import auth, pantry, recipes, meal_plans, shopping_list, alerts
2026-01-20T19:33:06.429225122Z [err]    File "/app/routes/__init__.py", line 5, in <module>
2026-01-20T19:33:06.429231803Z [err]      from . import auth, pantry, recipes, meal_plans, shopping_list, alerts
2026-01-20T19:33:06.429239584Z [err]    File "/app/routes/auth.py", line 14, in <module>
2026-01-20T19:33:06.429261352Z [err]    File "<frozen importlib._bootstrap>", line 1147, in _find_and_load_unlocked
2026-01-20T19:33:06.429537315Z [err]    File "<frozen importlib._bootstrap>", line 690, in _load_unlocked
2026-01-20T19:33:06.429545898Z [err]    File "<frozen importlib._bootstrap_external>", line 940, in exec_module
2026-01-20T19:33:06.429552639Z [err]    File "<frozen importlib._bootstrap>", line 241, in _call_with_frames_removed
2026-01-20T19:33:06.429561174Z [err]    File "/app/app.py", line 45, in <module>
2026-01-20T19:33:06.430796538Z [err]      class SignUpRequest(BaseModel):
2026-01-20T19:33:06.430810252Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_model_construction.py", line 182, in __new__
2026-01-20T19:33:06.430818391Z [err]      complete_model_class(
2026-01-20T19:33:06.430825365Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_model_construction.py", line 491, in complete_model_class
2026-01-20T19:33:06.430831772Z [err]      schema = cls.__get_pydantic_core_schema__(cls, handler)
2026-01-20T19:33:06.430838901Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:06.430847689Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/main.py", line 578, in __get_pydantic_core_schema__
2026-01-20T19:33:06.430854726Z [err]      return __handler(__source)
2026-01-20T19:33:06.430861422Z [err]             ^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:06.430869022Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_schema_generation_shared.py", line 82, in __call__
2026-01-20T19:33:06.433451089Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:06.433461107Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 541, in _model_schema
2026-01-20T19:33:06.433467252Z [err]      {k: self._generate_md_field_schema(k, v, decorators) for k, v in fields.items()},
2026-01-20T19:33:06.433487819Z [err]      schema = self._post_process_generated_schema(self._generate_schema_inner(obj))
2026-01-20T19:33:06.433497236Z [err]      schema = self._handler(__source_type)
2026-01-20T19:33:06.433497963Z [err]                                                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:06.433508126Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 722, in _generate_schema_inner
2026-01-20T19:33:06.433514079Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:06.433519008Z [err]      return self._model_schema(obj)
2026-01-20T19:33:06.433528057Z [err]      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:06.433529204Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 468, in generate_schema
2026-01-20T19:33:06.433544444Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 541, in <dictcomp>
2026-01-20T19:33:06.433544956Z [err]      schema = self._generate_schema(obj)
2026-01-20T19:33:06.433559388Z [err]      {k: self._generate_md_field_schema(k, v, decorators) for k, v in fields.items()},
2026-01-20T19:33:06.433560119Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:06.433573627Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 700, in _generate_schema
2026-01-20T19:33:06.433575170Z [err]          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:07.402421016Z [err]                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:07.402433157Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 616, in _generate_schema_from_property
2026-01-20T19:33:07.402439308Z [err]      schema = get_schema(
2026-01-20T19:33:07.402447869Z [err]               ^^^^^^^^^^^
2026-01-20T19:33:07.402497956Z [err]      schema = self._handler(__source_type)
2026-01-20T19:33:07.402512865Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:07.402520137Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 1633, in inner_handler
2026-01-20T19:33:07.402527568Z [err]      from_property = self._generate_schema_from_property(obj, obj)
2026-01-20T19:33:07.402701992Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 886, in _generate_md_field_schema
2026-01-20T19:33:07.402716194Z [err]      common_field = self._common_field_schema(name, field_info, decorators)
2026-01-20T19:33:07.402733663Z [err]                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:07.402734420Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:07.402748406Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 951, in _common_field_schema
2026-01-20T19:33:07.402753284Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 1654, in _apply_annotations
2026-01-20T19:33:07.402766238Z [err]      schema = get_inner_schema(source_type)
2026-01-20T19:33:07.402767417Z [err]      schema = self._apply_annotations(
2026-01-20T19:33:07.402778788Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:07.402785246Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_schema_generation_shared.py", line 82, in __call__
2026-01-20T19:33:07.405472760Z [err]      import email_validator
2026-01-20T19:33:07.405483426Z [err]  ModuleNotFoundError: No module named 'email_validator'
2026-01-20T19:33:07.405490088Z [err]  
2026-01-20T19:33:07.405495690Z [err]  The above exception was the direct cause of the following exception:
2026-01-20T19:33:07.405502551Z [err]  
2026-01-20T19:33:07.405508465Z [err]  Traceback (most recent call last):
2026-01-20T19:33:07.405513746Z [err]    File "/usr/local/bin/uvicorn", line 8, in <module>
2026-01-20T19:33:07.405518909Z [err]      sys.exit(main())
2026-01-20T19:33:07.405526427Z [err]               ^^^^^^
2026-01-20T19:33:07.405539889Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 1485, in __call__
2026-01-20T19:33:07.405559610Z [err]      return self.main(*args, **kwargs)
2026-01-20T19:33:07.405567387Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:07.405573179Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 1406, in main
2026-01-20T19:33:07.406679788Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/networks.py", line 390, in __get_pydantic_core_schema__
2026-01-20T19:33:07.406690272Z [err]      import_email_validator()
2026-01-20T19:33:07.406696592Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/networks.py", line 354, in import_email_validator
2026-01-20T19:33:07.406702518Z [err]      raise ImportError('email-validator is not installed, run `pip install pydantic[email]`') from e
2026-01-20T19:33:07.406707940Z [err]  ImportError: email-validator is not installed, run `pip install pydantic[email]`
2026-01-20T19:33:07.406713402Z [inf]  Starting uvicorn on port 8080...
2026-01-20T19:33:07.406722785Z [err]  Traceback (most recent call last):
2026-01-20T19:33:07.406727090Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/networks.py", line 352, in import_email_validator
2026-01-20T19:33:07.409082128Z [err]    File "/usr/local/lib/python3.11/asyncio/runners.py", line 118, in run
2026-01-20T19:33:07.409091033Z [err]      return self._loop.run_until_complete(task)
2026-01-20T19:33:07.409098720Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:07.409106329Z [err]    File "uvloop/loop.pyx", line 1518, in uvloop.loop.Loop.run_until_complete
2026-01-20T19:33:07.409124585Z [err]      rv = self.invoke(ctx)
2026-01-20T19:33:07.409130922Z [err]           ^^^^^^^^^^^^^^^^
2026-01-20T19:33:07.409136926Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 1269, in invoke
2026-01-20T19:33:07.409142527Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/server.py", line 62, in run
2026-01-20T19:33:07.409144259Z [err]      return ctx.invoke(self.callback, **ctx.params)
2026-01-20T19:33:07.409152278Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:07.409164550Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 824, in invoke
2026-01-20T19:33:07.409164757Z [err]      return asyncio.run(self.serve(sockets=sockets))
2026-01-20T19:33:07.409175101Z [err]      return callback(*args, **kwargs)
2026-01-20T19:33:07.409186688Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:07.409186984Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:07.409197079Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/main.py", line 418, in main
2026-01-20T19:33:07.409208208Z [err]    File "/usr/local/lib/python3.11/asyncio/runners.py", line 190, in run
2026-01-20T19:33:07.409210998Z [err]      run(
2026-01-20T19:33:07.409219817Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/main.py", line 587, in run
2026-01-20T19:33:07.409225144Z [err]      return runner.run(main)
2026-01-20T19:33:07.409233368Z [err]      server.run()
2026-01-20T19:33:07.409247765Z [err]             ^^^^^^^^^^^^^^^^
2026-01-20T19:33:07.411011969Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/server.py", line 69, in serve
2026-01-20T19:33:07.411015865Z [err]      config.load()
2026-01-20T19:33:07.411019847Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/config.py", line 458, in load
2026-01-20T19:33:07.411023877Z [err]      self.loaded_app = import_from_string(self.app)
2026-01-20T19:33:07.411029727Z [err]                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:07.411033687Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/importer.py", line 21, in import_from_string
2026-01-20T19:33:07.411037489Z [err]      module = importlib.import_module(module_str)
2026-01-20T19:33:07.411042321Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:07.411046148Z [err]    File "/usr/local/lib/python3.11/importlib/__init__.py", line 126, in import_module
2026-01-20T19:33:07.411052229Z [err]      return _bootstrap._gcd_import(name[level:], package, level)
2026-01-20T19:33:07.411058287Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:07.411065007Z [err]    File "<frozen importlib._bootstrap>", line 1204, in _gcd_import
2026-01-20T19:33:07.411069667Z [err]    File "<frozen importlib._bootstrap>", line 1176, in _find_and_load
2026-01-20T19:33:07.411074599Z [err]    File "<frozen importlib._bootstrap>", line 1147, in _find_and_load_unlocked
2026-01-20T19:33:07.411078570Z [err]    File "<frozen importlib._bootstrap>", line 690, in _load_unlocked
2026-01-20T19:33:07.411084252Z [err]    File "<frozen importlib._bootstrap_external>", line 940, in exec_module
2026-01-20T19:33:07.411089087Z [err]    File "<frozen importlib._bootstrap>", line 241, in _call_with_frames_removed
2026-01-20T19:33:07.411093083Z [err]    File "/app/app.py", line 45, in <module>
2026-01-20T19:33:07.411096968Z [err]      from routes import auth, pantry, recipes, meal_plans, shopping_list, alerts
2026-01-20T19:33:07.413150630Z [err]    File "/app/routes/__init__.py", line 5, in <module>
2026-01-20T19:33:07.413156205Z [err]      from . import auth, pantry, recipes, meal_plans, shopping_list, alerts
2026-01-20T19:33:07.413160346Z [err]    File "/app/routes/auth.py", line 14, in <module>
2026-01-20T19:33:07.413164820Z [err]      class SignUpRequest(BaseModel):
2026-01-20T19:33:07.413168445Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_model_construction.py", line 182, in __new__
2026-01-20T19:33:07.413171886Z [err]      complete_model_class(
2026-01-20T19:33:07.413175468Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_model_construction.py", line 491, in complete_model_class
2026-01-20T19:33:07.413179038Z [err]      schema = cls.__get_pydantic_core_schema__(cls, handler)
2026-01-20T19:33:07.413182483Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:07.413186792Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/main.py", line 578, in __get_pydantic_core_schema__
2026-01-20T19:33:07.413190400Z [err]      return __handler(__source)
2026-01-20T19:33:07.413193912Z [err]             ^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:07.413198105Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_schema_generation_shared.py", line 82, in __call__
2026-01-20T19:33:07.413201931Z [err]      schema = self._handler(__source_type)
2026-01-20T19:33:07.413205801Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:07.413209538Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 468, in generate_schema
2026-01-20T19:33:07.413214132Z [err]      schema = self._generate_schema(obj)
2026-01-20T19:33:07.413613978Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:07.413620894Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 700, in _generate_schema
2026-01-20T19:33:07.416193426Z [err]      schema = self._apply_annotations(
2026-01-20T19:33:07.416209284Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:07.416223792Z [err]      schema = self._post_process_generated_schema(self._generate_schema_inner(obj))
2026-01-20T19:33:07.416235110Z [err]                                                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:07.416241686Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 722, in _generate_schema_inner
2026-01-20T19:33:07.416251425Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:07.416251519Z [err]      return self._model_schema(obj)
2026-01-20T19:33:07.416267711Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 541, in _model_schema
2026-01-20T19:33:07.416277447Z [err]      {k: self._generate_md_field_schema(k, v, decorators) for k, v in fields.items()},
2026-01-20T19:33:07.416288582Z [err]      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:07.416299003Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 541, in <dictcomp>
2026-01-20T19:33:07.416316156Z [err]      {k: self._generate_md_field_schema(k, v, decorators) for k, v in fields.items()},
2026-01-20T19:33:07.416328865Z [err]          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:07.416337948Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 886, in _generate_md_field_schema
2026-01-20T19:33:07.416347980Z [err]      common_field = self._common_field_schema(name, field_info, decorators)
2026-01-20T19:33:07.416356803Z [err]                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:07.416370156Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 951, in _common_field_schema
2026-01-20T19:33:07.419786713Z [err]      import_email_validator()
2026-01-20T19:33:07.419796205Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:07.419797903Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/networks.py", line 354, in import_email_validator
2026-01-20T19:33:07.419806064Z [err]      raise ImportError('email-validator is not installed, run `pip install pydantic[email]`') from e
2026-01-20T19:33:07.419818030Z [err]  ImportError: email-validator is not installed, run `pip install pydantic[email]`
2026-01-20T19:33:07.419818149Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_schema_generation_shared.py", line 82, in __call__
2026-01-20T19:33:07.419831138Z [err]      schema = self._handler(__source_type)
2026-01-20T19:33:07.419839209Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:07.419845428Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 1633, in inner_handler
2026-01-20T19:33:07.419884320Z [err]      from_property = self._generate_schema_from_property(obj, obj)
2026-01-20T19:33:07.419898492Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 1654, in _apply_annotations
2026-01-20T19:33:07.419905081Z [err]                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:07.419918070Z [err]      schema = get_inner_schema(source_type)
2026-01-20T19:33:07.419920340Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 616, in _generate_schema_from_property
2026-01-20T19:33:07.419967760Z [err]      schema = get_schema(
2026-01-20T19:33:07.419975681Z [err]               ^^^^^^^^^^^
2026-01-20T19:33:07.419983659Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/networks.py", line 390, in __get_pydantic_core_schema__
2026-01-20T19:33:08.497937077Z [inf]  Starting uvicorn on port 8080...
2026-01-20T19:33:09.533612131Z [err]  Traceback (most recent call last):
2026-01-20T19:33:09.533617899Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/networks.py", line 352, in import_email_validator
2026-01-20T19:33:09.533624166Z [err]      import email_validator
2026-01-20T19:33:09.533629296Z [err]  ModuleNotFoundError: No module named 'email_validator'
2026-01-20T19:33:09.533635838Z [err]  
2026-01-20T19:33:09.533640960Z [err]  The above exception was the direct cause of the following exception:
2026-01-20T19:33:09.533645315Z [err]  
2026-01-20T19:33:09.533649688Z [err]  Traceback (most recent call last):
2026-01-20T19:33:09.533653898Z [err]    File "/usr/local/bin/uvicorn", line 8, in <module>
2026-01-20T19:33:09.533658918Z [err]      sys.exit(main())
2026-01-20T19:33:09.533664903Z [err]               ^^^^^^
2026-01-20T19:33:09.533669513Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 1485, in __call__
2026-01-20T19:33:09.533673845Z [err]      return self.main(*args, **kwargs)
2026-01-20T19:33:09.533678257Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:09.533683200Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 1406, in main
2026-01-20T19:33:09.533688561Z [err]      rv = self.invoke(ctx)
2026-01-20T19:33:09.533692999Z [err]           ^^^^^^^^^^^^^^^^
2026-01-20T19:33:09.533697806Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 1269, in invoke
2026-01-20T19:33:09.533703103Z [err]      return ctx.invoke(self.callback, **ctx.params)
2026-01-20T19:33:09.533708457Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:09.533712853Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 824, in invoke
2026-01-20T19:33:09.533716792Z [err]      return callback(*args, **kwargs)
2026-01-20T19:33:09.533722382Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:10.740030498Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/main.py", line 418, in main
2026-01-20T19:33:10.740036507Z [err]      run(
2026-01-20T19:33:10.740042390Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/main.py", line 587, in run
2026-01-20T19:33:10.740048462Z [err]      server.run()
2026-01-20T19:33:10.740058076Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/server.py", line 62, in run
2026-01-20T19:33:10.740086646Z [err]      return asyncio.run(self.serve(sockets=sockets))
2026-01-20T19:33:10.740092453Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:10.740099511Z [err]    File "/usr/local/lib/python3.11/asyncio/runners.py", line 190, in run
2026-01-20T19:33:10.740105097Z [err]      return runner.run(main)
2026-01-20T19:33:10.740114164Z [err]             ^^^^^^^^^^^^^^^^
2026-01-20T19:33:10.740120433Z [err]    File "/usr/local/lib/python3.11/asyncio/runners.py", line 118, in run
2026-01-20T19:33:10.740126429Z [err]      return self._loop.run_until_complete(task)
2026-01-20T19:33:10.740133202Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:10.740138592Z [err]    File "uvloop/loop.pyx", line 1518, in uvloop.loop.Loop.run_until_complete
2026-01-20T19:33:10.740144172Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/server.py", line 69, in serve
2026-01-20T19:33:10.740151748Z [err]      config.load()
2026-01-20T19:33:10.740157290Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/config.py", line 458, in load
2026-01-20T19:33:10.740178774Z [err]      self.loaded_app = import_from_string(self.app)
2026-01-20T19:33:10.740185611Z [err]                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:10.740191848Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/importer.py", line 21, in import_from_string
2026-01-20T19:33:10.740200000Z [err]      module = importlib.import_module(module_str)
2026-01-20T19:33:11.898504721Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:11.898509115Z [err]    File "/usr/local/lib/python3.11/importlib/__init__.py", line 126, in import_module
2026-01-20T19:33:11.898513559Z [err]      return _bootstrap._gcd_import(name[level:], package, level)
2026-01-20T19:33:11.898517851Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:11.898522994Z [err]    File "<frozen importlib._bootstrap>", line 1204, in _gcd_import
2026-01-20T19:33:11.898527407Z [err]    File "<frozen importlib._bootstrap>", line 1176, in _find_and_load
2026-01-20T19:33:11.898532120Z [err]    File "<frozen importlib._bootstrap>", line 1147, in _find_and_load_unlocked
2026-01-20T19:33:11.898537516Z [err]    File "<frozen importlib._bootstrap>", line 690, in _load_unlocked
2026-01-20T19:33:11.898541901Z [err]    File "<frozen importlib._bootstrap_external>", line 940, in exec_module
2026-01-20T19:33:11.898545938Z [err]    File "<frozen importlib._bootstrap>", line 241, in _call_with_frames_removed
2026-01-20T19:33:11.898551004Z [err]    File "/app/app.py", line 45, in <module>
2026-01-20T19:33:11.898555635Z [err]      from routes import auth, pantry, recipes, meal_plans, shopping_list, alerts
2026-01-20T19:33:11.898561381Z [err]    File "/app/routes/__init__.py", line 5, in <module>
2026-01-20T19:33:11.898566015Z [err]      from . import auth, pantry, recipes, meal_plans, shopping_list, alerts
2026-01-20T19:33:11.898570869Z [err]    File "/app/routes/auth.py", line 14, in <module>
2026-01-20T19:33:11.898575948Z [err]      class SignUpRequest(BaseModel):
2026-01-20T19:33:11.898580547Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_model_construction.py", line 182, in __new__
2026-01-20T19:33:11.898584959Z [err]      complete_model_class(
2026-01-20T19:33:11.898591540Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_model_construction.py", line 491, in complete_model_class
2026-01-20T19:33:13.030944726Z [err]      schema = cls.__get_pydantic_core_schema__(cls, handler)
2026-01-20T19:33:13.030951506Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:13.030957434Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/main.py", line 578, in __get_pydantic_core_schema__
2026-01-20T19:33:13.030965770Z [err]      return __handler(__source)
2026-01-20T19:33:13.030972957Z [err]             ^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:13.030979395Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_schema_generation_shared.py", line 82, in __call__
2026-01-20T19:33:13.030985570Z [err]      schema = self._handler(__source_type)
2026-01-20T19:33:13.030992674Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:13.031000981Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 468, in generate_schema
2026-01-20T19:33:13.031014961Z [err]      schema = self._generate_schema(obj)
2026-01-20T19:33:13.031020715Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:13.031026841Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 700, in _generate_schema
2026-01-20T19:33:13.031032400Z [err]      schema = self._post_process_generated_schema(self._generate_schema_inner(obj))
2026-01-20T19:33:13.031038602Z [err]                                                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:13.031044186Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 722, in _generate_schema_inner
2026-01-20T19:33:13.031051163Z [err]      return self._model_schema(obj)
2026-01-20T19:33:13.031057081Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:13.031063856Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 541, in _model_schema
2026-01-20T19:33:14.396526363Z [err]      {k: self._generate_md_field_schema(k, v, decorators) for k, v in fields.items()},
2026-01-20T19:33:14.396532007Z [err]      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:14.396539577Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 541, in <dictcomp>
2026-01-20T19:33:14.396547447Z [err]      {k: self._generate_md_field_schema(k, v, decorators) for k, v in fields.items()},
2026-01-20T19:33:14.396557046Z [err]          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:14.396562972Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 886, in _generate_md_field_schema
2026-01-20T19:33:14.396570475Z [err]      common_field = self._common_field_schema(name, field_info, decorators)
2026-01-20T19:33:14.396579888Z [err]                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:14.396586057Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 951, in _common_field_schema
2026-01-20T19:33:14.396593268Z [err]      schema = self._apply_annotations(
2026-01-20T19:33:14.396600706Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:14.396612186Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 1654, in _apply_annotations
2026-01-20T19:33:14.396618518Z [err]      schema = get_inner_schema(source_type)
2026-01-20T19:33:14.396625846Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:14.396633352Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_schema_generation_shared.py", line 82, in __call__
2026-01-20T19:33:14.396641165Z [err]      schema = self._handler(__source_type)
2026-01-20T19:33:14.396647821Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:15.665295195Z [err]      schema = get_schema(
2026-01-20T19:33:15.665309450Z [err]               ^^^^^^^^^^^
2026-01-20T19:33:15.665317150Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/networks.py", line 390, in __get_pydantic_core_schema__
2026-01-20T19:33:15.665324110Z [err]      import_email_validator()
2026-01-20T19:33:15.665330643Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/networks.py", line 354, in import_email_validator
2026-01-20T19:33:15.665341545Z [err]      raise ImportError('email-validator is not installed, run `pip install pydantic[email]`') from e
2026-01-20T19:33:15.665348643Z [err]  ImportError: email-validator is not installed, run `pip install pydantic[email]`
2026-01-20T19:33:15.665355104Z [inf]  Starting uvicorn on port 8080...
2026-01-20T19:33:15.665361426Z [err]  Traceback (most recent call last):
2026-01-20T19:33:15.665368921Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/networks.py", line 352, in import_email_validator
2026-01-20T19:33:15.665378196Z [err]      import email_validator
2026-01-20T19:33:15.665384854Z [err]  ModuleNotFoundError: No module named 'email_validator'
2026-01-20T19:33:15.665391028Z [err]  
2026-01-20T19:33:15.665397046Z [err]  The above exception was the direct cause of the following exception:
2026-01-20T19:33:15.665404395Z [err]  
2026-01-20T19:33:15.665410649Z [err]  Traceback (most recent call last):
2026-01-20T19:33:15.665865126Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 1633, in inner_handler
2026-01-20T19:33:15.665870936Z [err]      from_property = self._generate_schema_from_property(obj, obj)
2026-01-20T19:33:15.665878247Z [err]                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:15.665884044Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 616, in _generate_schema_from_property
2026-01-20T19:33:16.907164039Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:16.907178270Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 824, in invoke
2026-01-20T19:33:16.907185995Z [err]      return callback(*args, **kwargs)
2026-01-20T19:33:16.907192634Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:16.907198746Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/main.py", line 418, in main
2026-01-20T19:33:16.907205592Z [err]      run(
2026-01-20T19:33:16.907211590Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/main.py", line 587, in run
2026-01-20T19:33:16.907218055Z [err]      server.run()
2026-01-20T19:33:16.907225314Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/server.py", line 62, in run
2026-01-20T19:33:16.907231845Z [err]      return asyncio.run(self.serve(sockets=sockets))
2026-01-20T19:33:16.907242335Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:16.907480597Z [err]    File "/usr/local/bin/uvicorn", line 8, in <module>
2026-01-20T19:33:16.907485166Z [err]      sys.exit(main())
2026-01-20T19:33:16.907489854Z [err]               ^^^^^^
2026-01-20T19:33:16.907494627Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 1485, in __call__
2026-01-20T19:33:16.907500265Z [err]      return self.main(*args, **kwargs)
2026-01-20T19:33:16.907504253Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:16.907510555Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 1406, in main
2026-01-20T19:33:16.907514228Z [err]      rv = self.invoke(ctx)
2026-01-20T19:33:16.907518010Z [err]           ^^^^^^^^^^^^^^^^
2026-01-20T19:33:16.907521723Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 1269, in invoke
2026-01-20T19:33:16.907526870Z [err]      return ctx.invoke(self.callback, **ctx.params)
2026-01-20T19:33:17.973200101Z [err]    File "/usr/local/lib/python3.11/asyncio/runners.py", line 190, in run
2026-01-20T19:33:17.973204196Z [err]      return runner.run(main)
2026-01-20T19:33:17.973207959Z [err]             ^^^^^^^^^^^^^^^^
2026-01-20T19:33:17.973211323Z [err]    File "/usr/local/lib/python3.11/asyncio/runners.py", line 118, in run
2026-01-20T19:33:17.973214832Z [err]      return self._loop.run_until_complete(task)
2026-01-20T19:33:17.973218263Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:17.973222359Z [err]    File "uvloop/loop.pyx", line 1518, in uvloop.loop.Loop.run_until_complete
2026-01-20T19:33:17.973225850Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/server.py", line 69, in serve
2026-01-20T19:33:17.973229322Z [err]      config.load()
2026-01-20T19:33:17.973233047Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/config.py", line 458, in load
2026-01-20T19:33:17.973237908Z [err]      self.loaded_app = import_from_string(self.app)
2026-01-20T19:33:17.973245977Z [err]                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:17.973249664Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/importer.py", line 21, in import_from_string
2026-01-20T19:33:17.973253412Z [err]      module = importlib.import_module(module_str)
2026-01-20T19:33:17.973256960Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:17.973260662Z [err]    File "/usr/local/lib/python3.11/importlib/__init__.py", line 126, in import_module
2026-01-20T19:33:17.973264488Z [err]      return _bootstrap._gcd_import(name[level:], package, level)
2026-01-20T19:33:17.973268216Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:17.973271817Z [err]    File "<frozen importlib._bootstrap>", line 1204, in _gcd_import
2026-01-20T19:33:17.973275480Z [err]    File "<frozen importlib._bootstrap>", line 1176, in _find_and_load
2026-01-20T19:33:18.847551216Z [err]    File "<frozen importlib._bootstrap>", line 1147, in _find_and_load_unlocked
2026-01-20T19:33:18.847556504Z [err]    File "<frozen importlib._bootstrap>", line 690, in _load_unlocked
2026-01-20T19:33:18.847561374Z [err]    File "<frozen importlib._bootstrap_external>", line 940, in exec_module
2026-01-20T19:33:18.847567490Z [err]    File "<frozen importlib._bootstrap>", line 241, in _call_with_frames_removed
2026-01-20T19:33:18.847577447Z [err]    File "/app/app.py", line 45, in <module>
2026-01-20T19:33:18.847584403Z [err]      from routes import auth, pantry, recipes, meal_plans, shopping_list, alerts
2026-01-20T19:33:18.847642903Z [err]      schema = self._handler(__source_type)
2026-01-20T19:33:18.847651797Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.847658626Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 468, in generate_schema
2026-01-20T19:33:18.847665356Z [err]      schema = self._generate_schema(obj)
2026-01-20T19:33:18.847672880Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.847679434Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 700, in _generate_schema
2026-01-20T19:33:18.847686196Z [err]      schema = self._post_process_generated_schema(self._generate_schema_inner(obj))
2026-01-20T19:33:18.847693465Z [err]                                                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.847700840Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 722, in _generate_schema_inner
2026-01-20T19:33:18.847708041Z [err]      return self._model_schema(obj)
2026-01-20T19:33:18.847714997Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.847721272Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 541, in _model_schema
2026-01-20T19:33:18.847728358Z [err]      {k: self._generate_md_field_schema(k, v, decorators) for k, v in fields.items()},
2026-01-20T19:33:18.847734254Z [err]      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.847740876Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 541, in <dictcomp>
2026-01-20T19:33:18.847750095Z [err]      {k: self._generate_md_field_schema(k, v, decorators) for k, v in fields.items()},
2026-01-20T19:33:18.847756037Z [err]          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.847807038Z [err]    File "/app/routes/__init__.py", line 5, in <module>
2026-01-20T19:33:18.847816155Z [err]      from . import auth, pantry, recipes, meal_plans, shopping_list, alerts
2026-01-20T19:33:18.847823972Z [err]    File "/app/routes/auth.py", line 14, in <module>
2026-01-20T19:33:18.847832918Z [err]      class SignUpRequest(BaseModel):
2026-01-20T19:33:18.847840469Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_model_construction.py", line 182, in __new__
2026-01-20T19:33:18.847847156Z [err]      complete_model_class(
2026-01-20T19:33:18.847855128Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_model_construction.py", line 491, in complete_model_class
2026-01-20T19:33:18.847862323Z [err]      schema = cls.__get_pydantic_core_schema__(cls, handler)
2026-01-20T19:33:18.847868901Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.847875636Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/main.py", line 578, in __get_pydantic_core_schema__
2026-01-20T19:33:18.847880718Z [err]      return __handler(__source)
2026-01-20T19:33:18.847888598Z [err]             ^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.847894909Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_schema_generation_shared.py", line 82, in __call__
2026-01-20T19:33:18.851047395Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 886, in _generate_md_field_schema
2026-01-20T19:33:18.851056002Z [err]      common_field = self._common_field_schema(name, field_info, decorators)
2026-01-20T19:33:18.851064670Z [err]                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.851073856Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 951, in _common_field_schema
2026-01-20T19:33:18.851098133Z [err]      schema = self._apply_annotations(
2026-01-20T19:33:18.851128372Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.851139459Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 1654, in _apply_annotations
2026-01-20T19:33:18.851150706Z [err]      schema = get_inner_schema(source_type)
2026-01-20T19:33:18.851158923Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.851195571Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_schema_generation_shared.py", line 82, in __call__
2026-01-20T19:33:18.851205447Z [err]      schema = self._handler(__source_type)
2026-01-20T19:33:18.851296058Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.851441739Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 1633, in inner_handler
2026-01-20T19:33:18.851459445Z [err]      from_property = self._generate_schema_from_property(obj, obj)
2026-01-20T19:33:18.851470741Z [err]                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.851481402Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 616, in _generate_schema_from_property
2026-01-20T19:33:18.851491623Z [err]      schema = get_schema(
2026-01-20T19:33:18.851501793Z [err]               ^^^^^^^^^^^
2026-01-20T19:33:18.858756610Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/networks.py", line 390, in __get_pydantic_core_schema__
2026-01-20T19:33:18.858763669Z [err]      import_email_validator()
2026-01-20T19:33:18.858770929Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/networks.py", line 354, in import_email_validator
2026-01-20T19:33:18.858778365Z [err]      raise ImportError('email-validator is not installed, run `pip install pydantic[email]`') from e
2026-01-20T19:33:18.858785700Z [err]  ImportError: email-validator is not installed, run `pip install pydantic[email]`
2026-01-20T19:33:18.858792667Z [inf]  Starting uvicorn on port 8080...
2026-01-20T19:33:18.858799921Z [err]  Traceback (most recent call last):
2026-01-20T19:33:18.858813669Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/networks.py", line 352, in import_email_validator
2026-01-20T19:33:18.858819677Z [err]      import email_validator
2026-01-20T19:33:18.858826187Z [err]  ModuleNotFoundError: No module named 'email_validator'
2026-01-20T19:33:18.858834434Z [err]  
2026-01-20T19:33:18.858846427Z [err]  The above exception was the direct cause of the following exception:
2026-01-20T19:33:18.858853849Z [err]  
2026-01-20T19:33:18.858863926Z [err]  Traceback (most recent call last):
2026-01-20T19:33:18.858870092Z [err]    File "/usr/local/bin/uvicorn", line 8, in <module>
2026-01-20T19:33:18.858879593Z [err]      sys.exit(main())
2026-01-20T19:33:18.858884724Z [err]               ^^^^^^
2026-01-20T19:33:18.858890577Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 1485, in __call__
2026-01-20T19:33:18.858896337Z [err]      return self.main(*args, **kwargs)
2026-01-20T19:33:18.858903043Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.858908740Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 1406, in main
2026-01-20T19:33:18.860177637Z [err]      rv = self.invoke(ctx)
2026-01-20T19:33:18.860183560Z [err]           ^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.860189474Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 1269, in invoke
2026-01-20T19:33:18.860196286Z [err]      return ctx.invoke(self.callback, **ctx.params)
2026-01-20T19:33:18.860202091Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.860208104Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 824, in invoke
2026-01-20T19:33:18.860213951Z [err]      return callback(*args, **kwargs)
2026-01-20T19:33:18.860221100Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.860227195Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/main.py", line 418, in main
2026-01-20T19:33:18.860232874Z [err]      run(
2026-01-20T19:33:18.860238960Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/main.py", line 587, in run
2026-01-20T19:33:18.860245395Z [err]      server.run()
2026-01-20T19:33:18.860251934Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/server.py", line 62, in run
2026-01-20T19:33:18.860258607Z [err]      return asyncio.run(self.serve(sockets=sockets))
2026-01-20T19:33:18.860264730Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.860271370Z [err]    File "/usr/local/lib/python3.11/asyncio/runners.py", line 190, in run
2026-01-20T19:33:18.860277650Z [err]      return runner.run(main)
2026-01-20T19:33:18.860283760Z [err]             ^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.860289167Z [err]    File "/usr/local/lib/python3.11/asyncio/runners.py", line 118, in run
2026-01-20T19:33:18.860294638Z [err]      return self._loop.run_until_complete(task)
2026-01-20T19:33:18.860299913Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.860304560Z [err]    File "uvloop/loop.pyx", line 1518, in uvloop.loop.Loop.run_until_complete
2026-01-20T19:33:18.862044007Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/server.py", line 69, in serve
2026-01-20T19:33:18.862050047Z [err]      config.load()
2026-01-20T19:33:18.862056234Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/config.py", line 458, in load
2026-01-20T19:33:18.862063972Z [err]      self.loaded_app = import_from_string(self.app)
2026-01-20T19:33:18.862070565Z [err]                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.862076751Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/importer.py", line 21, in import_from_string
2026-01-20T19:33:18.862082671Z [err]      module = importlib.import_module(module_str)
2026-01-20T19:33:18.862090742Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.862096896Z [err]    File "/usr/local/lib/python3.11/importlib/__init__.py", line 126, in import_module
2026-01-20T19:33:18.862103552Z [err]      return _bootstrap._gcd_import(name[level:], package, level)
2026-01-20T19:33:18.862109677Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.862131332Z [err]    File "<frozen importlib._bootstrap>", line 1204, in _gcd_import
2026-01-20T19:33:18.862139064Z [err]    File "<frozen importlib._bootstrap>", line 1176, in _find_and_load
2026-01-20T19:33:18.862147793Z [err]    File "<frozen importlib._bootstrap>", line 1147, in _find_and_load_unlocked
2026-01-20T19:33:18.862157487Z [err]    File "<frozen importlib._bootstrap>", line 690, in _load_unlocked
2026-01-20T19:33:18.862164077Z [err]    File "<frozen importlib._bootstrap_external>", line 940, in exec_module
2026-01-20T19:33:18.862171528Z [err]    File "<frozen importlib._bootstrap>", line 241, in _call_with_frames_removed
2026-01-20T19:33:18.862178008Z [err]    File "/app/app.py", line 45, in <module>
2026-01-20T19:33:18.862184154Z [err]      from routes import auth, pantry, recipes, meal_plans, shopping_list, alerts
2026-01-20T19:33:18.864514957Z [err]    File "/app/routes/__init__.py", line 5, in <module>
2026-01-20T19:33:18.864519042Z [err]      from . import auth, pantry, recipes, meal_plans, shopping_list, alerts
2026-01-20T19:33:18.864523955Z [err]    File "/app/routes/auth.py", line 14, in <module>
2026-01-20T19:33:18.864527533Z [err]      class SignUpRequest(BaseModel):
2026-01-20T19:33:18.864531853Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_model_construction.py", line 182, in __new__
2026-01-20T19:33:18.864538498Z [err]      complete_model_class(
2026-01-20T19:33:18.864544738Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_model_construction.py", line 491, in complete_model_class
2026-01-20T19:33:18.864550645Z [err]      schema = cls.__get_pydantic_core_schema__(cls, handler)
2026-01-20T19:33:18.864557652Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.864564265Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/main.py", line 578, in __get_pydantic_core_schema__
2026-01-20T19:33:18.864569421Z [err]      return __handler(__source)
2026-01-20T19:33:18.864575391Z [err]             ^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.864580973Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_schema_generation_shared.py", line 82, in __call__
2026-01-20T19:33:18.864589579Z [err]      schema = self._handler(__source_type)
2026-01-20T19:33:18.864595475Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.864600815Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 468, in generate_schema
2026-01-20T19:33:18.864606216Z [err]      schema = self._generate_schema(obj)
2026-01-20T19:33:18.864611476Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.864616579Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 700, in _generate_schema
2026-01-20T19:33:18.866260356Z [err]      schema = self._apply_annotations(
2026-01-20T19:33:18.866271500Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.866278643Z [err]      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.866288683Z [err]      schema = self._post_process_generated_schema(self._generate_schema_inner(obj))
2026-01-20T19:33:18.866290095Z [err]      {k: self._generate_md_field_schema(k, v, decorators) for k, v in fields.items()},
2026-01-20T19:33:18.866296511Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 541, in <dictcomp>
2026-01-20T19:33:18.866302831Z [err]          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.866309631Z [err]                                                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.866311155Z [err]      common_field = self._common_field_schema(name, field_info, decorators)
2026-01-20T19:33:18.866314034Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 886, in _generate_md_field_schema
2026-01-20T19:33:18.866319807Z [err]                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.866326863Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 951, in _common_field_schema
2026-01-20T19:33:18.866338707Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.866340133Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 722, in _generate_schema_inner
2026-01-20T19:33:18.866357340Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 541, in _model_schema
2026-01-20T19:33:18.866359991Z [err]      return self._model_schema(obj)
2026-01-20T19:33:18.866368198Z [err]      {k: self._generate_md_field_schema(k, v, decorators) for k, v in fields.items()},
2026-01-20T19:33:18.870469693Z [inf]  Starting uvicorn on port 8080...
2026-01-20T19:33:18.870484889Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 616, in _generate_schema_from_property
2026-01-20T19:33:18.870497941Z [err]      schema = get_schema(
2026-01-20T19:33:18.870510875Z [err]               ^^^^^^^^^^^
2026-01-20T19:33:18.870523456Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/networks.py", line 390, in __get_pydantic_core_schema__
2026-01-20T19:33:18.870530614Z [err]      import_email_validator()
2026-01-20T19:33:18.870537936Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/networks.py", line 354, in import_email_validator
2026-01-20T19:33:18.870546111Z [err]      raise ImportError('email-validator is not installed, run `pip install pydantic[email]`') from e
2026-01-20T19:33:18.870555390Z [err]  ImportError: email-validator is not installed, run `pip install pydantic[email]`
2026-01-20T19:33:18.870572577Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 1654, in _apply_annotations
2026-01-20T19:33:18.870585398Z [err]      schema = get_inner_schema(source_type)
2026-01-20T19:33:18.870595340Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.870604303Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_schema_generation_shared.py", line 82, in __call__
2026-01-20T19:33:18.870612759Z [err]      schema = self._handler(__source_type)
2026-01-20T19:33:18.870621142Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.870630257Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 1633, in inner_handler
2026-01-20T19:33:18.870638509Z [err]      from_property = self._generate_schema_from_property(obj, obj)
2026-01-20T19:33:18.870648498Z [err]                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.874849478Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.874859298Z [err]               ^^^^^^
2026-01-20T19:33:18.874866244Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 1485, in __call__
2026-01-20T19:33:18.874875081Z [err]  Traceback (most recent call last):
2026-01-20T19:33:18.874883319Z [err]      return ctx.invoke(self.callback, **ctx.params)
2026-01-20T19:33:18.874886064Z [err]  Traceback (most recent call last):
2026-01-20T19:33:18.874890321Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 1406, in main
2026-01-20T19:33:18.874893664Z [err]      return self.main(*args, **kwargs)
2026-01-20T19:33:18.874896914Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.874905103Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/networks.py", line 352, in import_email_validator
2026-01-20T19:33:18.874908091Z [err]    File "/usr/local/bin/uvicorn", line 8, in <module>
2026-01-20T19:33:18.874910622Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.874913714Z [err]      rv = self.invoke(ctx)
2026-01-20T19:33:18.874915715Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 824, in invoke
2026-01-20T19:33:18.874917163Z [err]  
2026-01-20T19:33:18.874919509Z [err]      import email_validator
2026-01-20T19:33:18.874927921Z [err]      sys.exit(main())
2026-01-20T19:33:18.874934358Z [err]           ^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.874934417Z [err]      return callback(*args, **kwargs)
2026-01-20T19:33:18.874937536Z [err]  The above exception was the direct cause of the following exception:
2026-01-20T19:33:18.874938772Z [err]  ModuleNotFoundError: No module named 'email_validator'
2026-01-20T19:33:18.874949736Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 1269, in invoke
2026-01-20T19:33:18.874951513Z [err]  
2026-01-20T19:33:18.877589058Z [err]      run(
2026-01-20T19:33:18.877600800Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/main.py", line 587, in run
2026-01-20T19:33:18.877603290Z [err]      module = importlib.import_module(module_str)
2026-01-20T19:33:18.877610170Z [err]      server.run()
2026-01-20T19:33:18.877618211Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/server.py", line 62, in run
2026-01-20T19:33:18.877622768Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.877632642Z [err]    File "uvloop/loop.pyx", line 1518, in uvloop.loop.Loop.run_until_complete
2026-01-20T19:33:18.877642161Z [err]      return asyncio.run(self.serve(sockets=sockets))
2026-01-20T19:33:18.877644246Z [err]    File "/usr/local/lib/python3.11/asyncio/runners.py", line 118, in run
2026-01-20T19:33:18.877645063Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/server.py", line 69, in serve
2026-01-20T19:33:18.877655257Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.877657630Z [err]      config.load()
2026-01-20T19:33:18.877663222Z [err]      return self._loop.run_until_complete(task)
2026-01-20T19:33:18.877669963Z [err]    File "/usr/local/lib/python3.11/asyncio/runners.py", line 190, in run
2026-01-20T19:33:18.877675481Z [err]      return runner.run(main)
2026-01-20T19:33:18.877681445Z [err]             ^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.877685973Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/config.py", line 458, in load
2026-01-20T19:33:18.877689978Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/main.py", line 418, in main
2026-01-20T19:33:18.877696521Z [err]      self.loaded_app = import_from_string(self.app)
2026-01-20T19:33:18.877701749Z [err]                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.877706762Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/importer.py", line 21, in import_from_string
2026-01-20T19:33:18.883937873Z [err]      return self._model_schema(obj)
2026-01-20T19:33:18.883950844Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.883958254Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 541, in _model_schema
2026-01-20T19:33:18.884000670Z [err]                                                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.884013478Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 722, in _generate_schema_inner
2026-01-20T19:33:18.884780147Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.884788885Z [err]    File "/usr/local/lib/python3.11/importlib/__init__.py", line 126, in import_module
2026-01-20T19:33:18.884795895Z [err]      return _bootstrap._gcd_import(name[level:], package, level)
2026-01-20T19:33:18.884803238Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.884809257Z [err]    File "<frozen importlib._bootstrap>", line 1204, in _gcd_import
2026-01-20T19:33:18.884816097Z [err]    File "<frozen importlib._bootstrap>", line 1176, in _find_and_load
2026-01-20T19:33:18.884824569Z [err]    File "<frozen importlib._bootstrap>", line 1147, in _find_and_load_unlocked
2026-01-20T19:33:18.884830362Z [err]    File "<frozen importlib._bootstrap>", line 690, in _load_unlocked
2026-01-20T19:33:18.884836425Z [err]    File "<frozen importlib._bootstrap_external>", line 940, in exec_module
2026-01-20T19:33:18.884841661Z [err]    File "<frozen importlib._bootstrap>", line 241, in _call_with_frames_removed
2026-01-20T19:33:18.884846864Z [err]    File "/app/app.py", line 45, in <module>
2026-01-20T19:33:18.885385942Z [err]      from routes import auth, pantry, recipes, meal_plans, shopping_list, alerts
2026-01-20T19:33:18.885399433Z [err]    File "/app/routes/__init__.py", line 5, in <module>
2026-01-20T19:33:18.885405929Z [err]      from . import auth, pantry, recipes, meal_plans, shopping_list, alerts
2026-01-20T19:33:18.885419483Z [err]    File "/app/routes/auth.py", line 14, in <module>
2026-01-20T19:33:18.885425873Z [err]      class SignUpRequest(BaseModel):
2026-01-20T19:33:18.885431757Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_model_construction.py", line 182, in __new__
2026-01-20T19:33:18.885437998Z [err]      complete_model_class(
2026-01-20T19:33:18.885448160Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_model_construction.py", line 491, in complete_model_class
2026-01-20T19:33:18.885740696Z [err]      schema = cls.__get_pydantic_core_schema__(cls, handler)
2026-01-20T19:33:18.885746363Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.885753304Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/main.py", line 578, in __get_pydantic_core_schema__
2026-01-20T19:33:18.885758771Z [err]      return __handler(__source)
2026-01-20T19:33:18.885765140Z [err]             ^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.885780197Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_schema_generation_shared.py", line 82, in __call__
2026-01-20T19:33:18.885790416Z [err]      schema = self._handler(__source_type)
2026-01-20T19:33:18.886183899Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.886202951Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 468, in generate_schema
2026-01-20T19:33:18.886215295Z [err]      schema = self._generate_schema(obj)
2026-01-20T19:33:18.886222881Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.886247393Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 700, in _generate_schema
2026-01-20T19:33:18.886254682Z [err]      schema = self._post_process_generated_schema(self._generate_schema_inner(obj))
2026-01-20T19:33:18.888842613Z [err]      {k: self._generate_md_field_schema(k, v, decorators) for k, v in fields.items()},
2026-01-20T19:33:18.888846782Z [err]      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.888851782Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 541, in <dictcomp>
2026-01-20T19:33:18.888856510Z [err]      {k: self._generate_md_field_schema(k, v, decorators) for k, v in fields.items()},
2026-01-20T19:33:18.888861420Z [err]          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.888865561Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 886, in _generate_md_field_schema
2026-01-20T19:33:18.888870425Z [err]      common_field = self._common_field_schema(name, field_info, decorators)
2026-01-20T19:33:18.888875124Z [err]                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.888879651Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 951, in _common_field_schema
2026-01-20T19:33:18.888884577Z [err]      schema = self._apply_annotations(
2026-01-20T19:33:18.888888709Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.888893582Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 1654, in _apply_annotations
2026-01-20T19:33:18.888897578Z [err]      schema = get_inner_schema(source_type)
2026-01-20T19:33:18.888902955Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.888908401Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_schema_generation_shared.py", line 82, in __call__
2026-01-20T19:33:18.888912286Z [err]      schema = self._handler(__source_type)
2026-01-20T19:33:18.888916635Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.892935640Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 1633, in inner_handler
2026-01-20T19:33:18.892941634Z [err]      from_property = self._generate_schema_from_property(obj, obj)
2026-01-20T19:33:18.892947252Z [err]                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:18.892952719Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 616, in _generate_schema_from_property
2026-01-20T19:33:18.892958888Z [err]      schema = get_schema(
2026-01-20T19:33:18.892964549Z [err]               ^^^^^^^^^^^
2026-01-20T19:33:18.892975102Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/networks.py", line 390, in __get_pydantic_core_schema__
2026-01-20T19:33:18.892980339Z [err]      import_email_validator()
2026-01-20T19:33:18.892985276Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/networks.py", line 354, in import_email_validator
2026-01-20T19:33:18.892990818Z [err]      raise ImportError('email-validator is not installed, run `pip install pydantic[email]`') from e
2026-01-20T19:33:18.892996417Z [err]  ImportError: email-validator is not installed, run `pip install pydantic[email]`
2026-01-20T19:33:21.053390944Z [inf]  Starting uvicorn on port 8080...
2026-01-20T19:33:22.198705248Z [err]  Traceback (most recent call last):
2026-01-20T19:33:22.198710954Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/networks.py", line 352, in import_email_validator
2026-01-20T19:33:22.198717243Z [err]      import email_validator
2026-01-20T19:33:22.198723183Z [err]  ModuleNotFoundError: No module named 'email_validator'
2026-01-20T19:33:22.198733864Z [err]  
2026-01-20T19:33:22.198740838Z [err]  The above exception was the direct cause of the following exception:
2026-01-20T19:33:22.198747880Z [err]  
2026-01-20T19:33:22.198753728Z [err]  Traceback (most recent call last):
2026-01-20T19:33:22.198759430Z [err]    File "/usr/local/bin/uvicorn", line 8, in <module>
2026-01-20T19:33:22.198770643Z [err]      sys.exit(main())
2026-01-20T19:33:22.198776011Z [err]               ^^^^^^
2026-01-20T19:33:22.198781639Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 1485, in __call__
2026-01-20T19:33:22.198786764Z [err]      return self.main(*args, **kwargs)
2026-01-20T19:33:22.198791738Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:22.198796854Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 1406, in main
2026-01-20T19:33:22.198803330Z [err]      rv = self.invoke(ctx)
2026-01-20T19:33:22.198811629Z [err]           ^^^^^^^^^^^^^^^^
2026-01-20T19:33:22.198817365Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 1269, in invoke
2026-01-20T19:33:22.198823782Z [err]      return ctx.invoke(self.callback, **ctx.params)
2026-01-20T19:33:22.198830199Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:22.198837161Z [err]    File "/usr/local/lib/python3.11/site-packages/click/core.py", line 824, in invoke
2026-01-20T19:33:22.198844256Z [err]      return callback(*args, **kwargs)
2026-01-20T19:33:22.198851166Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:23.388551915Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/main.py", line 418, in main
2026-01-20T19:33:23.388563412Z [err]      run(
2026-01-20T19:33:23.388568792Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/main.py", line 587, in run
2026-01-20T19:33:23.388575091Z [err]      server.run()
2026-01-20T19:33:23.388581585Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/server.py", line 62, in run
2026-01-20T19:33:23.388589204Z [err]      return asyncio.run(self.serve(sockets=sockets))
2026-01-20T19:33:23.388594584Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:23.388600239Z [err]    File "/usr/local/lib/python3.11/asyncio/runners.py", line 190, in run
2026-01-20T19:33:23.388606162Z [err]      return runner.run(main)
2026-01-20T19:33:23.388611642Z [err]             ^^^^^^^^^^^^^^^^
2026-01-20T19:33:23.388616452Z [err]    File "/usr/local/lib/python3.11/asyncio/runners.py", line 118, in run
2026-01-20T19:33:23.388624714Z [err]      return self._loop.run_until_complete(task)
2026-01-20T19:33:23.388630806Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:23.388638123Z [err]    File "uvloop/loop.pyx", line 1518, in uvloop.loop.Loop.run_until_complete
2026-01-20T19:33:23.388643810Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/server.py", line 69, in serve
2026-01-20T19:33:23.388649209Z [err]      config.load()
2026-01-20T19:33:23.388654695Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/config.py", line 458, in load
2026-01-20T19:33:23.388661085Z [err]      self.loaded_app = import_from_string(self.app)
2026-01-20T19:33:23.388667166Z [err]                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:23.388672984Z [err]    File "/usr/local/lib/python3.11/site-packages/uvicorn/importer.py", line 21, in import_from_string
2026-01-20T19:33:23.388679288Z [err]      module = importlib.import_module(module_str)
2026-01-20T19:33:24.550246746Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_model_construction.py", line 491, in complete_model_class
2026-01-20T19:33:24.550280825Z [err]    File "/usr/local/lib/python3.11/importlib/__init__.py", line 126, in import_module
2026-01-20T19:33:24.550289122Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:24.550289797Z [err]      return _bootstrap._gcd_import(name[level:], package, level)
2026-01-20T19:33:24.550304020Z [err]    File "/app/routes/auth.py", line 14, in <module>
2026-01-20T19:33:24.550312749Z [err]      class SignUpRequest(BaseModel):
2026-01-20T19:33:24.550319782Z [err]    File "/app/routes/__init__.py", line 5, in <module>
2026-01-20T19:33:24.550326944Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_model_construction.py", line 182, in __new__
2026-01-20T19:33:24.550333557Z [err]      from . import auth, pantry, recipes, meal_plans, shopping_list, alerts
2026-01-20T19:33:24.550340548Z [err]      complete_model_class(
2026-01-20T19:33:24.550354051Z [err]    File "<frozen importlib._bootstrap>", line 1147, in _find_and_load_unlocked
2026-01-20T19:33:24.550363024Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:24.550365595Z [err]    File "<frozen importlib._bootstrap_external>", line 940, in exec_module
2026-01-20T19:33:24.550371941Z [err]    File "<frozen importlib._bootstrap>", line 690, in _load_unlocked
2026-01-20T19:33:24.550375183Z [err]    File "<frozen importlib._bootstrap>", line 1204, in _gcd_import
2026-01-20T19:33:24.550382654Z [err]    File "<frozen importlib._bootstrap>", line 241, in _call_with_frames_removed
2026-01-20T19:33:24.550389659Z [err]    File "<frozen importlib._bootstrap>", line 1176, in _find_and_load
2026-01-20T19:33:24.550406369Z [err]    File "/app/app.py", line 45, in <module>
2026-01-20T19:33:24.550423018Z [err]      from routes import auth, pantry, recipes, meal_plans, shopping_list, alerts
2026-01-20T19:33:25.575244865Z [err]      schema = cls.__get_pydantic_core_schema__(cls, handler)
2026-01-20T19:33:25.575258380Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:25.575267172Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/main.py", line 578, in __get_pydantic_core_schema__
2026-01-20T19:33:25.575275990Z [err]      return __handler(__source)
2026-01-20T19:33:25.575284564Z [err]             ^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:25.575293158Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_schema_generation_shared.py", line 82, in __call__
2026-01-20T19:33:25.575301787Z [err]      schema = self._handler(__source_type)
2026-01-20T19:33:25.575308890Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:25.575315357Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 468, in generate_schema
2026-01-20T19:33:25.575322656Z [err]      schema = self._generate_schema(obj)
2026-01-20T19:33:25.575329575Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:25.575335192Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 700, in _generate_schema
2026-01-20T19:33:25.575340867Z [err]      schema = self._post_process_generated_schema(self._generate_schema_inner(obj))
2026-01-20T19:33:25.575346725Z [err]                                                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:25.575353483Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 722, in _generate_schema_inner
2026-01-20T19:33:25.575369703Z [err]      return self._model_schema(obj)
2026-01-20T19:33:25.575378305Z [err]             ^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:25.575385197Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 541, in _model_schema
2026-01-20T19:33:26.666429435Z [err]      {k: self._generate_md_field_schema(k, v, decorators) for k, v in fields.items()},
2026-01-20T19:33:26.666438042Z [err]      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:26.666446656Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 541, in <dictcomp>
2026-01-20T19:33:26.666452923Z [err]      {k: self._generate_md_field_schema(k, v, decorators) for k, v in fields.items()},
2026-01-20T19:33:26.666460430Z [err]          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:26.666467632Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 886, in _generate_md_field_schema
2026-01-20T19:33:26.666474220Z [err]      common_field = self._common_field_schema(name, field_info, decorators)
2026-01-20T19:33:26.666484761Z [err]                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:26.666491023Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 951, in _common_field_schema
2026-01-20T19:33:26.666497868Z [err]      schema = self._apply_annotations(
2026-01-20T19:33:26.666507674Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:26.666526015Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py", line 1654, in _apply_annotations
2026-01-20T19:33:26.666536066Z [err]      schema = get_inner_schema(source_type)
2026-01-20T19:33:26.666543590Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
2026-01-20T19:33:26.666554208Z [err]    File "/usr/local/lib/python3.11/site-packages/pydantic/_internal/_schema_generation_shared.py", line 82, in __call__
2026-01-20T19:33:26.666560590Z [err]      schema = self._handler(__source_type)
2026-01-20T19:33:26.666568183Z [err]               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^